require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vet_consultations (
      id                SERIAL PRIMARY KEY,
      animal_id         INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
      consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('virtual', 'in_person')),
      scheduled_at      TIMESTAMPTZ NOT NULL,
      status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      rancher_notes     TEXT,
      animal_snapshot   JSONB,
      created_at        TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
