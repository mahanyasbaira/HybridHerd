const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/animals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.tag_id,
        a.name,
        a.breed,
        a.birth_date,
        a.created_at,
        (SELECT current_risk FROM alerts WHERE animal_id = a.id ORDER BY triggered_at DESC LIMIT 1) as latest_risk
      FROM animals a
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching animals:', err);
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
    console.error('Error creating animal:', err);
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

// GET /api/animals/:id
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

    const noseRingResult = await pool.query(
      `SELECT id, temperature_c, respiratory_rate, recorded_at, created_at
       FROM nose_ring_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
       ORDER BY recorded_at DESC`,
      [id]
    );

    const collarResult = await pool.query(
      `SELECT id, chew_frequency, cough_count, recorded_at, created_at
       FROM collar_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
       ORDER BY recorded_at DESC`,
      [id]
    );

    const earTagResult = await pool.query(
      `SELECT id, behavior_index, recorded_at, created_at
       FROM ear_tag_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
       ORDER BY recorded_at DESC`,
      [id]
    );

    const alertResult = await pool.query(
      `SELECT id, previous_risk, current_risk, ml_score, triggered_at, acknowledged, acknowledged_at
       FROM alerts
       WHERE animal_id = $1
       ORDER BY triggered_at DESC
       LIMIT 1`,
      [id]
    );

    res.json({
      ...animal,
      latest_alert: alertResult.rows[0] || null,
      telemetry_24h: {
        nose_ring: noseRingResult.rows,
        collar: collarResult.rows,
        ear_tag: earTagResult.rows,
      },
    });
  } catch (err) {
    console.error('Error fetching animal details:', err);
    res.status(500).json({ error: 'Failed to fetch animal details' });
  }
});

module.exports = router;
