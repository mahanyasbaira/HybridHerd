const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /api/consultations — create
router.post('/', auth, async (req, res) => {
  const { animal_id, consultation_type, scheduled_at, rancher_notes } = req.body;
  if (!animal_id || !consultation_type || !scheduled_at) {
    return res.status(400).json({ message: 'animal_id, consultation_type, and scheduled_at are required' });
  }

  // Capture animal snapshot
  const snap = await pool.query(
    `SELECT a.name, a.tag_id, a.breed,
            nr.temperature_c, nr.respiratory_rate,
            et.behavior_index,
            c.chew_frequency, c.cough_count,
            al.current_risk, al.ml_score
     FROM animals a
     LEFT JOIN LATERAL (
       SELECT temperature_c, respiratory_rate FROM nose_ring_readings
       WHERE animal_id = a.id ORDER BY recorded_at DESC LIMIT 1
     ) nr ON true
     LEFT JOIN LATERAL (
       SELECT behavior_index FROM ear_tag_readings
       WHERE animal_id = a.id ORDER BY recorded_at DESC LIMIT 1
     ) et ON true
     LEFT JOIN LATERAL (
       SELECT chew_frequency, cough_count FROM collar_readings
       WHERE animal_id = a.id ORDER BY recorded_at DESC LIMIT 1
     ) c ON true
     LEFT JOIN LATERAL (
       SELECT current_risk, ml_score FROM alerts
       WHERE animal_id = a.id ORDER BY triggered_at DESC LIMIT 1
     ) al ON true
     WHERE a.id = $1`,
    [animal_id]
  );

  const snapshot = snap.rows[0] || null;

  const result = await pool.query(
    `INSERT INTO vet_consultations
       (animal_id, consultation_type, scheduled_at, rancher_notes, animal_snapshot)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [animal_id, consultation_type, scheduled_at, rancher_notes || null, JSON.stringify(snapshot)]
  );

  res.status(201).json({ data: result.rows[0] });
});

// GET /api/consultations — list all
router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    `SELECT vc.*, a.name as animal_name, a.tag_id
     FROM vet_consultations vc
     JOIN animals a ON a.id = vc.animal_id
     ORDER BY vc.scheduled_at ASC`
  );
  res.json({ data: result.rows });
});

// GET /api/consultations/animal/:animalId
router.get('/animal/:animalId', auth, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM vet_consultations
     WHERE animal_id = $1
     ORDER BY scheduled_at ASC`,
    [req.params.animalId]
  );
  res.json({ data: result.rows });
});

// PATCH /api/consultations/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const result = await pool.query(
    `UPDATE vet_consultations SET status = $1 WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ message: 'Not found' });
  res.json({ data: result.rows[0] });
});

module.exports = router;
