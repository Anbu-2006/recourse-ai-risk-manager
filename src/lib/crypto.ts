import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, AuditLedgerRow } from './db';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
const HMAC_SECRET = process.env.RECOURSE_HMAC_SECRET || 'recourse_super_secret_production_key_32_chars';
const KEYS_FILE = path.resolve(process.cwd(), 'recourse_keys.json');

// Persistent Ed25519 keypair so signatures remain valid across server restarts
function getOrCreateKeyPair(): crypto.KeyPairSyncResult<string, string> {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
      if (data.publicKey && data.privateKey) {
        return data;
      }
    }
  } catch {}

  const pair = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(pair, null, 2), 'utf-8');
  } catch {}

  return pair;
}

export const sessionKeyPair = getOrCreateKeyPair();

/**
 * Computes SHA-256 hash of an arbitrary string
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Signs data using the Ed25519 private key
 */
export function signEd25519(data: string): string {
  return crypto.sign(null, Buffer.from(data, 'utf-8'), sessionKeyPair.privateKey).toString('base64');
}

/**
 * Verifies Ed25519 signature
 */
export function verifyEd25519(data: string, signatureBase64: string, publicKeyPem: string = sessionKeyPair.publicKey): boolean {
  try {
    return crypto.verify(
      null,
      Buffer.from(data, 'utf-8'),
      publicKeyPem,
      Buffer.from(signatureBase64, 'base64')
    );
  } catch {
    return false;
  }
}

/**
 * Computes Merkle Node Hash:
 * H(N_i) = SHA-256( H(N_{i-1}) || SHA-256(Payload) || Ed25519_Sig || Timestamp || Nonce )
 */
export function computeNodeHash(
  previousHash: string,
  payloadHash: string,
  signature: string,
  timestamp: number,
  nonce: string
): string {
  const preimage = `${previousHash}:${payloadHash}:${signature}:${timestamp}:${nonce}`;
  return sha256(preimage);
}

/**
 * Proof of Gate Execution (PGE) Token:
 * Base64(payload).Base64(HMAC-SHA256(payload || nodeHash))
 */
export function generateProofOfGateExecution(payload: Record<string, any>, nodeHash: string): string {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf-8').toString('base64url');
  
  const hmac = crypto.createHmac('sha256', HMAC_SECRET)
    .update(`${payloadStr}:${nodeHash}`)
    .digest('base64url');
    
  return `pge_${payloadB64}.${hmac}`;
}

export const generatePGEToken = generateProofOfGateExecution;

/**
 * Creates and signs an Intent Receipt for agentic transactions, persisting to intent_receipts
 */
export function createIntentReceipt(
  userPrompt: string,
  modelHash: string,
  userVpa: string,
  extractedIntent: Record<string, any>
): {
  intentId: string;
  rawPromptHash: string;
  modelHash: string;
  userVpa: string;
  extractedIntent: Record<string, any>;
  agentSignature: string;
  createdAt: number;
} {
  const db = getDb();
  const intentId = `intent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const rawPromptHash = sha256(userPrompt);
  const intentJson = JSON.stringify(extractedIntent);
  const attestationData = `${intentId}:${rawPromptHash}:${modelHash}:${userVpa}:${intentJson}`;
  const agentSignature = signEd25519(sha256(attestationData));
  const createdAt = Date.now();

  try {
    db.prepare(`
      INSERT INTO intent_receipts (
        intent_id, raw_prompt_hash, model_hash, user_vpa,
        extracted_intent_json, agent_signature, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      intentId,
      rawPromptHash,
      modelHash,
      userVpa,
      intentJson,
      agentSignature,
      createdAt
    );
  } catch (err) {
    console.error("Error writing intent receipt to SQLite:", err);
  }

  return {
    intentId,
    rawPromptHash,
    modelHash,
    userVpa,
    extractedIntent,
    agentSignature,
    createdAt,
  };
}

export interface MerkleNodeResult {
  nodeIndex: number;
  previousHash: string;
  nodeHash: string;
  payload: Record<string, any>;
  signature: string;
  timestamp: number;
  pgeToken: string;
}

/**
 * Appends a verified event to the append-only Merkle ledger
 */
export function appendAuditNode(payload: Record<string, any>): MerkleNodeResult {
  const db = getDb();
  
  // Get last node in ledger
  const lastNode = db.prepare('SELECT node_index, node_hash FROM audit_ledger ORDER BY node_index DESC LIMIT 1').get() as {
    node_index: number;
    node_hash: string;
  } | undefined;

  const nodeIndex = lastNode ? lastNode.node_index + 1 : 0;
  const previousHash = lastNode ? lastNode.node_hash : GENESIS_HASH;
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  
  const payloadJson = JSON.stringify({ ...payload, nonce });
  const payloadHash = sha256(payloadJson);
  const signature = signEd25519(payloadHash);
  const nodeHash = computeNodeHash(previousHash, payloadHash, signature, timestamp, nonce);
  
  // Persist atomically to SQLite WAL
  db.prepare(`
    INSERT INTO audit_ledger (node_index, previous_hash, node_hash, payload_json, signature, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nodeIndex, previousHash, nodeHash, payloadJson, signature, timestamp);

  const pgeToken = generateProofOfGateExecution(payload, nodeHash);

  return {
    nodeIndex,
    previousHash,
    nodeHash,
    payload,
    signature,
    timestamp,
    pgeToken,
  };
}

/**
 * Verifies the entire cryptographic Merkle chain from genesis to head
 */
export function verifyChainIntegrity(): {
  valid: boolean;
  chainLength: number;
  genesisHash: string;
  lastHash: string;
  verifiedAt: number;
  errors: string[];
} {
  const db = getDb();
  const nodes = db.prepare('SELECT * FROM audit_ledger ORDER BY node_index ASC').all() as AuditLedgerRow[];
  const errors: string[] = [];

  if (nodes.length === 0) {
    return {
      valid: true,
      chainLength: 0,
      genesisHash: GENESIS_HASH,
      lastHash: GENESIS_HASH,
      verifiedAt: Date.now(),
      errors: [],
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.node_index !== i) {
      errors.push(`Sequence gap at index ${i}: found index ${node.node_index}`);
    }

    if (node.previous_hash !== expectedPrevHash) {
      errors.push(`Hash link broken at index ${i}: expected prev ${expectedPrevHash.slice(0, 10)}, got ${node.previous_hash.slice(0, 10)}`);
    }

    try {
      const parsedPayload = JSON.parse(node.payload_json);
      const nonce = parsedPayload.nonce || '';
      const payloadHash = sha256(node.payload_json);
      
      // Verify Ed25519 signature
      const sigValid = verifyEd25519(payloadHash, node.signature);
      if (!sigValid) {
        errors.push(`Invalid Ed25519 signature at node ${node.node_index}`);
      }

      // Verify node hash recalculation
      const recalculatedHash = computeNodeHash(
        node.previous_hash,
        payloadHash,
        node.signature,
        node.timestamp,
        nonce
      );

      if (recalculatedHash !== node.node_hash) {
        errors.push(`Hash mismatch at node ${node.node_index}: expected ${node.node_hash.slice(0, 10)}, computed ${recalculatedHash.slice(0, 10)}`);
      }
    } catch (e: any) {
      errors.push(`Failed parsing node ${node.node_index}: ${e.message}`);
    }

    expectedPrevHash = node.node_hash;
  }

  return {
    valid: errors.length === 0,
    chainLength: nodes.length,
    genesisHash: GENESIS_HASH,
    lastHash: nodes[nodes.length - 1].node_hash,
    verifiedAt: Date.now(),
    errors,
  };
}

export const RecourseAuditEngine = {
  genesisHash: sha256("GENESIS_MANDATE_RECOURSE_ENTERPRISE"),
  appendNode: appendAuditNode,
  verifyChainIntegrity,
  sessionKeyPair,
  generatePGEToken,
  createIntentReceipt,
};

