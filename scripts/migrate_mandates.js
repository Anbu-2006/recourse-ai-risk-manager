const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(process.cwd(), 'recourse.db'));
const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='mandates'").get();
console.log('Current SQL:', tableSql ? tableSql.sql : 'None');

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
  console.log('Migration SUCCESS: PENDING_APPROVAL added to CHECK constraint');
} else {
  console.log('Migration already applied or not needed.');
}
