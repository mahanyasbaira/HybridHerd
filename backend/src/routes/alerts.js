const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');
const { checkAndCreateAlert } = require('../services/alertService');

const router = express.Router();

// GET /api/alerts
router.get('/', authenticateToken, async (req, res) => {
  const { acknowledged } = req.query;
  try {
    const whereClause = acknowledged === 'true' ? '' : 'WHERE a.acknowledged = FALSE';
    const result = await pool.query(`
      SELECT
        a.id,
        a.animal_id,
        a.previous_risk,
        a.current_risk,
        a.current_risk AS risk,
        a.ml_score,
        a.triggered_at AS timestamp,
        a.acknowledged,
        a.acknowledged_at,
        an.tag_id,
        an.name AS animal_name
      FROM alerts a
      JOIN animals an ON a.animal_id = an.id
      ${whereClause}
      ORDER BY a.triggered_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PATCH /api/alerts/:id/acknowledge
router.patch('/:id/acknowledge', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE alerts
       SET acknowledged = TRUE, acknowledged_at = NOW()
       WHERE id = $1
       RETURNING id, animal_id, previous_risk, current_risk, ml_score, triggered_at, acknowledged, acknowledged_at`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// POST /api/alerts/check/:animalId
router.post('/check/:animalId', authenticateToken, async (req, res) => {
  const { animalId } = req.params;

  try {
    // Verify animal exists
    const animalCheck = await pool.query('SELECT id FROM animals WHERE id = $1', [animalId]);
    if (animalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const alert = await checkAndCreateAlert(parseInt(animalId, 10), pool);

    if (alert) {
      res.status(201).json({
        message: 'Alert created',
        alert,
      });
    } else {
      res.status(200).json({
        message: 'No alert needed',
        alert: null,
      });
    }
  } catch (err) {
    console.error('Error checking animal:', err);
    res.status(500).json({ error: err.message || 'Failed to check animal' });
  }
});

module.exports = router;
