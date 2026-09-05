import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'recourse.db');

// Global singleton pattern for Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  dbInstance: Database.Database | undefined;
};

export function getDb(): Database.Database {
  if (!globalForDb.dbInstance) {
    const db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? undefined : undefined,
    });
    
    // Enable Write-Ahead Logging (WAL) for sub-millisecond atomic transactions
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');

    initSchema(db);
    seedInitialData(db);

    globalForDb.dbInstance = db;
  }

  return globalForDb.dbInstance;
}

function initSchema(db: Database.Database) {
  // Mandates & Policies
  db.exec(`
    CREATE TABLE IF NOT EXISTS mandates (
      mandate_id TEXT PRIMARY KEY,
      user_vpa TEXT NOT NULL,
      category TEXT NOT NULL,
      per_item_cap_paisa INTEGER NOT NULL,
      allowed_merchants TEXT NOT NULL,
      schedule_days TEXT DEFAULT '["Everyday"]',
      initial_hold_paisa INTEGER NOT NULL,
      residual_balance_paisa INTEGER NOT NULL,
      status TEXT CHECK(status IN ('ACTIVE','PENDING_APPROVAL','INACTIVE','EXHAUSTED','PARTIALLY_DEBITED','DISPUTED','REVERSED')) NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Orders & Risk Telemetry
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      amount_paisa INTEGER NOT NULL,
      raw_address TEXT NOT NULL,
      ads_score REAL NOT NULL,
      risk_tier TEXT CHECK(risk_tier IN ('LOW','MEDIUM','HIGH')) NOT NULL,
      payment_strategy TEXT CHECK(payment_strategy IN ('DIRECT_COD','REQUIRE_SHIPPING_DEPOSIT','UPI_RESERVE_HOLD')) NOT NULL,
      deposit_paisa INTEGER DEFAULT 0,
      razorpay_order_id TEXT,
      pge_token TEXT,
      intent_receipt_id TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Disputes & Representment Dossiers
    CREATE TABLE IF NOT EXISTS disputes (
      dispute_id TEXT PRIMARY KEY,
      razorpay_payment_id TEXT NOT NULL,
      amount_paisa INTEGER NOT NULL,
      reason_code TEXT NOT NULL,
      status TEXT CHECK(status IN ('OPEN','CONTESTED','WON','LOST')) NOT NULL,
      awb_number TEXT,
      carrier_otp_verified INTEGER DEFAULT 0,
      ce3_matched INTEGER DEFAULT 0,
      dossier_json TEXT,
      win_probability REAL,
      contested_at INTEGER
    );

    -- Intent Receipts (Signed Attestation Ledger)
    CREATE TABLE IF NOT EXISTS intent_receipts (
      intent_id TEXT PRIMARY KEY,
      raw_prompt_hash TEXT NOT NULL,
      model_hash TEXT NOT NULL,
      user_vpa TEXT NOT NULL,
      extracted_intent_json TEXT NOT NULL,
      agent_signature TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Cryptographic Merkle Ledger
    CREATE TABLE IF NOT EXISTS audit_ledger (
      node_index INTEGER NOT NULL,
      previous_hash TEXT NOT NULL,
      node_hash TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      signature TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );

    -- Historical Customers (Visa CE 3.0 Device / IP Matching)
    CREATE TABLE IF NOT EXISTS historical_customers (
      customer_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      device_fingerprint TEXT NOT NULL,
      settled_transaction_count INTEGER NOT NULL,
      first_settled_at INTEGER NOT NULL
    );

    -- Visa Compelling Evidence 3.0 (CE 3.0) Historical Ledger
    CREATE TABLE IF NOT EXISTS historical_transactions (
      tx_id TEXT PRIMARY KEY,
      customer_email TEXT NOT NULL,
      customer_ip TEXT NOT NULL,
      device_fingerprint TEXT NOT NULL,
      amount_paisa INTEGER NOT NULL,
      settled_at INTEGER NOT NULL,
      undisputed INTEGER DEFAULT 1,
      status TEXT NOT NULL
    );
  `);

  // Safe migrations for preexisting databases
  try {
    db.exec(`ALTER TABLE mandates ADD COLUMN schedule_days TEXT DEFAULT '["Everyday"]'`);
  } catch {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN intent_receipt_id TEXT`);
  } catch {}

  try {
    const tableSql = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='mandates'`).get() as { sql: string } | undefined;
    if (tableSql && !tableSql.sql.includes('PENDING_APPROVAL')) {
      db.exec(`
        PRAGMA foreign_keys=OFF;
        CREATE TABLE mandates_migrated (
          mandate_id TEXT PRIMARY KEY,
          user_vpa TEXT NOT NULL,
          category TEXT NOT NULL,
          per_item_cap_paisa INTEGER NOT NULL,
          allowed_merchants TEXT NOT NULL,
          schedule_days TEXT DEFAULT '["Everyday"]',
          initial_hold_paisa INTEGER NOT NULL,
          residual_balance_paisa INTEGER NOT NULL,
          status TEXT CHECK(status IN ('ACTIVE','PENDING_APPROVAL','INACTIVE','EXHAUSTED','PARTIALLY_DEBITED','DISPUTED','REVERSED')) NOT NULL,
          created_at INTEGER NOT NULL
        );
        INSERT INTO mandates_migrated SELECT mandate_id, user_vpa, category, per_item_cap_paisa, allowed_merchants, COALESCE(schedule_days, '["Everyday"]'), initial_hold_paisa, residual_balance_paisa, status, created_at FROM mandates;
        DROP TABLE mandates;
        ALTER TABLE mandates_migrated RENAME TO mandates;
        PRAGMA foreign_keys=ON;
      `);
    }
  } catch (migErr) {
    console.warn('Mandate table migration check:', migErr);
  }
}

function seedInitialData(db: Database.Database) {
  // 1. Seed Mandate: mandate_groceries_001
  const existingMandate = db.prepare('SELECT mandate_id FROM mandates WHERE mandate_id = ?').get('mandate_groceries_001');
  if (!existingMandate) {
    db.prepare(`
      INSERT INTO mandates (
        mandate_id, user_vpa, category, per_item_cap_paisa,
        allowed_merchants, initial_hold_paisa, residual_balance_paisa,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'mandate_groceries_001',
      'anbuselvan@upi',
      'Groceries',
      50000, // ₹500.00 per-item cap
      JSON.stringify(['ExaStore', 'BigBasket', 'Blinkit', 'Zepto']),
      200000, // ₹2,000.00 initial hold
      200000, // ₹2,000.00 residual balance
      'ACTIVE',
      Date.now()
    );
  }

  // Ensure ExaStore is in existing mandates
  try {
    const activeMandates = db.prepare("SELECT mandate_id, allowed_merchants FROM mandates").all() as Array<{ mandate_id: string; allowed_merchants: string }>;
    for (const m of activeMandates) {
      try {
        const merchants = JSON.parse(m.allowed_merchants);
        if (Array.isArray(merchants) && !merchants.includes('ExaStore')) {
          merchants.unshift('ExaStore');
          db.prepare("UPDATE mandates SET allowed_merchants = ? WHERE mandate_id = ?").run(JSON.stringify(merchants), m.mandate_id);
        }
      } catch {}
    }
  } catch {}

  // 2. Seed Historical Settled Transactions (180 days ago for Visa CE 3.0)
  const existingHist = db.prepare('SELECT COUNT(*) as count FROM historical_transactions').get() as { count: number };
  if (existingHist.count === 0) {
    const oneHundredEightyDaysAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const oneHundredTwentyDaysAgo = Date.now() - (120 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    const insertHist = db.prepare(`
      INSERT INTO historical_transactions (
        tx_id, customer_email, customer_ip, device_fingerprint,
        amount_paisa, settled_at, undisputed, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertHist.run(
      'tx_hist_001',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      45000, // ₹450.00
      oneHundredEightyDaysAgo,
      1,
      'SETTLED'
    );

    insertHist.run(
      'tx_hist_002',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      38000, // ₹380.00
      oneHundredTwentyDaysAgo,
      1,
      'SETTLED'
    );

    insertHist.run(
      'tx_hist_003',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      125000, // ₹1,250.00
      ninetyDaysAgo,
      1,
      'SETTLED'
    );

    insertHist.run(
      'tx_hist_004',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      89000, // ₹890.00
      sixtyDaysAgo,
      1,
      'SETTLED'
    );

    insertHist.run(
      'tx_hist_005',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      210000, // ₹2,100.00
      thirtyDaysAgo,
      1,
      'SETTLED'
    );
  }

  // 3. Seed Historical Customer (Visa CE 3.0 Telemetry)
  const existingCust = db.prepare('SELECT customer_id FROM historical_customers WHERE customer_id = ?').get('cust_ce3_001');
  if (!existingCust) {
    db.prepare(`
      INSERT INTO historical_customers (
        customer_id, email, ip_address, device_fingerprint,
        settled_transaction_count, first_settled_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'cust_ce3_001',
      'customer@enterprise.in',
      '49.36.128.45',
      'dev_fp_987654',
      4,
      Date.now() - 15552000000 // 180 days ago
    );
  }

  // 4. Seed Initial Active Dispute for instant demo review in Screen 2
  const existingDispute = db.prepare('SELECT dispute_id FROM disputes WHERE dispute_id = ?').get('disp_razorpay_98765');
  if (!existingDispute) {
    db.prepare(`
      INSERT INTO disputes (
        dispute_id, razorpay_payment_id, amount_paisa, reason_code,
        status, awb_number, carrier_otp_verified, ce3_matched,
        dossier_json, win_probability, contested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'disp_razorpay_98765',
      'pay_test_delhivery_987654',
      189900, // ₹1,899.00
      'fraudulent_chargeback_dao',
      'OPEN',
      '987654321',
      1,
      1,
      null,
      0.92,
      null
    );
  }
}

// Helper types
export interface MandateRow {
  mandate_id: string;
  user_vpa: string;
  category: string;
  per_item_cap_paisa: number;
  allowed_merchants: string;
  schedule_days?: string;
  initial_hold_paisa: number;
  residual_balance_paisa: number;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'INACTIVE' | 'EXHAUSTED' | string;
  created_at: number;
}

export interface OrderRow {
  order_id: string;
  amount_paisa: number;
  raw_address: string;
  ads_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  payment_strategy: 'DIRECT_COD' | 'REQUIRE_SHIPPING_DEPOSIT' | 'UPI_RESERVE_HOLD';
  deposit_paisa: number;
  razorpay_order_id?: string;
  pge_token?: string;
  intent_receipt_id?: string;
  status: string;
  created_at: number;
}

export interface DisputeRow {
  dispute_id: string;
  razorpay_payment_id: string;
  amount_paisa: number;
  reason_code: string;
  status: 'OPEN' | 'CONTESTED' | 'WON' | 'LOST';
  awb_number?: string;
  carrier_otp_verified: number;
  ce3_matched: number;
  dossier_json?: string;
  win_probability?: number;
  contested_at?: number;
}

export interface IntentReceiptRow {
  intent_id: string;
  raw_prompt_hash: string;
  model_hash: string;
  user_vpa: string;
  extracted_intent_json: string;
  agent_signature: string;
  created_at: number;
}

export interface AuditLedgerRow {
  node_index: number;
  previous_hash: string;
  node_hash: string;
  payload_json: string;
  signature: string;
  timestamp: number;
}

export interface HistoricalCustomerRow {
  customer_id: string;
  email: string;
  ip_address: string;
  device_fingerprint: string;
  settled_transaction_count: number;
  first_settled_at: number;
}

export interface HistoricalTxRow {
  tx_id: string;
  customer_email: string;
  customer_ip: string;
  device_fingerprint: string;
  amount_paisa: number;
  settled_at: number;
  undisputed: number;
  status: string;
}

