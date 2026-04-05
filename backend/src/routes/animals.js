const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/animals — list with latest risk + most recent telemetry snapshot
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { risk } = req.query;

    const result = await pool.query(`
      SELECT
        a.id,
        a.tag_id,
        a.name,
        a.breed,
        a.birth_date,
        a.created_at,
        a.is_manually_flagged,
        latest_alert.current_risk,
        nr.temperature_c        AS nr_temperature_c,
        nr.respiratory_rate     AS nr_respiratory_rate,
        et.behavior_index       AS et_behavior_index
      FROM animals a
      LEFT JOIN LATERAL (
        SELECT current_risk FROM alerts
        WHERE animal_id = a.id
        ORDER BY triggered_at DESC LIMIT 1
      ) latest_alert ON true
      LEFT JOIN LATERAL (
        SELECT temperature_c, respiratory_rate FROM nose_ring_readings
        WHERE animal_id = a.id
        ORDER BY recorded_at DESC LIMIT 1
      ) nr ON true
      LEFT JOIN LATERAL (
        SELECT behavior_index FROM ear_tag_readings
        WHERE animal_id = a.id
        ORDER BY recorded_at DESC LIMIT 1
      ) et ON true
      ORDER BY a.created_at DESC
    `);

    let animals = result.rows.map((row) => ({
      id: row.id,
      tag_id: row.tag_id,
      name: row.name,
      breed: row.breed,
      birth_date: row.birth_date,
      created_at: row.created_at,
      is_manually_flagged: row.is_manually_flagged || false,
      current_risk: row.current_risk || 'Low',
      nose_ring: row.nr_temperature_c != null
        ? { temperature_c: row.nr_temperature_c, respiratory_rate: row.nr_respiratory_rate }
        : null,
      ear_tag: row.et_behavior_index != null
        ? { behavior_index: row.et_behavior_index }
        : null,
    }));

    if (risk && risk !== 'All') {
      animals = animals.filter((a) => a.current_risk === risk);
    }

    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// POST /api/animals
router.post('/', authenticateToken, async (req, res) => {
  const { tag_id, name, breed, birth_date } = req.body;

  if (!tag_id) {
    return res.status(400).json({ error: 'Missing required field: tag_id' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO animals (tag_id, name, breed, birth_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tag_id, name, breed, birth_date, created_at`,
      [tag_id, name || null, breed || null, birth_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Animal with this tag_id already exists' });
    }
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

// GET /api/animals/:id — full detail with latest telemetry snapshot + 24h history
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const animalResult = await pool.query(
      `SELECT id, tag_id, name, breed, birth_date, created_at FROM animals WHERE id = $1`,
      [id]
    );

    if (animalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const animal = animalResult.rows[0];

    const [noseRingResult, collarResult, earTagResult, alertResult] = await Promise.all([
      pool.query(
        `SELECT temperature_c, respiratory_rate, recorded_at
         FROM nose_ring_readings
         WHERE animal_id = $1
         ORDER BY recorded_at DESC LIMIT 48`,
        [id]
      ),
      pool.query(
        `SELECT chew_frequency, cough_count, recorded_at
         FROM collar_readings
         WHERE animal_id = $1
         ORDER BY recorded_at DESC LIMIT 48`,
        [id]
      ),
      pool.query(
        `SELECT behavior_index, recorded_at
         FROM ear_tag_readings
         WHERE animal_id = $1
         ORDER BY recorded_at DESC LIMIT 48`,
        [id]
      ),
      pool.query(
        `SELECT id, previous_risk, current_risk, ml_score, triggered_at, acknowledged
         FROM alerts
         WHERE animal_id = $1
         ORDER BY triggered_at DESC LIMIT 1`,
        [id]
      ),
    ]);

    const latestAlert = alertResult.rows[0] || null;
    const latestNr = noseRingResult.rows[0] || {};
    const latestCollar = collarResult.rows[0] || {};
    const latestEarTag = earTagResult.rows[0] || {};

    res.json({
      ...animal,
      current_risk: latestAlert?.current_risk || 'Low',
      latest_alert_id: latestAlert?.id || null,
      nose_ring: {
        temperature_c: latestNr.temperature_c,
        respiratory_rate: latestNr.respiratory_rate,
      },
      collar: {
        chew_frequency: latestCollar.chew_frequency,
        cough_count: latestCollar.cough_count,
      },
      ear_tag: {
        behavior_index: latestEarTag.behavior_index,
      },
      telemetry_24h: {
        nose_ring: noseRingResult.rows,
        collar: collarResult.rows,
        ear_tag: earTagResult.rows,
      },
      latest_alert: latestAlert,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch animal details' });
  }
});

// PATCH /api/animals/:id/flag — toggle manual flag
router.patch('/:id/flag', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE animals
       SET is_manually_flagged = NOT is_manually_flagged
       WHERE id = $1
       RETURNING id, tag_id, name, is_manually_flagged`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle flag' });
  }
});

// DELETE /api/animals/:id — disown/remove animal
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM animals WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

module.exports = router;
