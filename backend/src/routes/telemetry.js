const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/telemetry/nose-ring
router.post('/nose-ring', authenticateToken, async (req, res) => {
  const { animal_id, temperature_c, respiratory_rate, recorded_at } = req.body;

  if (!animal_id || recorded_at === undefined) {
    return res.status(400).json({ error: 'Missing required fields: animal_id, recorded_at' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO nose_ring_readings (animal_id, temperature_c, respiratory_rate, recorded_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, animal_id, temperature_c, respiratory_rate, recorded_at, created_at`,
      [animal_id, temperature_c || null, respiratory_rate || null, recorded_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting nose ring reading:', err);
    res.status(500).json({ error: 'Failed to insert reading' });
  }
});

// POST /api/telemetry/collar
router.post('/collar', authenticateToken, async (req, res) => {
  const { animal_id, chew_frequency, cough_count, recorded_at } = req.body;

  if (!animal_id || recorded_at === undefined) {
    return res.status(400).json({ error: 'Missing required fields: animal_id, recorded_at' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO collar_readings (animal_id, chew_frequency, cough_count, recorded_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, animal_id, chew_frequency, cough_count, recorded_at, created_at`,
      [animal_id, chew_frequency || null, cough_count || null, recorded_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting collar reading:', err);
    res.status(500).json({ error: 'Failed to insert reading' });
  }
});

// POST /api/telemetry/ear-tag
router.post('/ear-tag', authenticateToken, async (req, res) => {
  const { animal_id, behavior_index, recorded_at } = req.body;

  if (!animal_id || recorded_at === undefined) {
    return res.status(400).json({ error: 'Missing required fields: animal_id, recorded_at' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ear_tag_readings (animal_id, behavior_index, recorded_at)
       VALUES ($1, $2, $3)
       RETURNING id, animal_id, behavior_index, recorded_at, created_at`,
      [animal_id, behavior_index || null, recorded_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting ear tag reading:', err);
    res.status(500).json({ error: 'Failed to insert reading' });
  }
});

module.exports = router;
