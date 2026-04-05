#!/usr/bin/env node
/**
 * Migration v2: adds is_manually_flagged to animals and creates animal_notes table.
 * Run: node src/db/migrate_v2.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool = require('./pool');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add flagging column to animals
    await client.query(`
      ALTER TABLE animals
      ADD COLUMN IF NOT EXISTS is_manually_flagged BOOLEAN NOT NULL DEFAULT FALSE
    `);

    // Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS animal_notes (
        id         SERIAL PRIMARY KEY,
        animal_id  INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
        note       TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_animal_notes_animal_id ON animal_notes(animal_id)
    `);

    await client.query('COMMIT');
    process.stdout.write('Migration v2 complete.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    process.stderr.write(`Migration v2 failed: ${err}\n`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
