const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');
const { buildNotificationPayload } = require('../services/alertService');
const { generateVetBriefing } = require('../services/geminiService');

const router = express.Router();

// POST /api/telehealth
router.post('/', authenticateToken, async (req, res) => {
  const { alert_id, rancher_note } = req.body;

  if (!alert_id) {
    return res.status(400).json({ error: 'Missing required field: alert_id' });
  }

  try {
    // Verify alert exists and is unacknowledged
    const alertCheck = await pool.query(
      'SELECT id, animal_id, current_risk, ml_score, triggered_at FROM alerts WHERE id = $1',
      [alert_id]
    );

    if (alertCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const alert = alertCheck.rows[0];

    // Create telehealth action
    const result = await pool.query(
      `INSERT INTO telehealth_actions (alert_id, rancher_note, rancher_sent_at, status)
       VALUES ($1, $2, NOW(), 'sent_to_vet')
       RETURNING id, alert_id, rancher_note, rancher_sent_at, vet_note, vet_action, vet_responded_at, status, created_at`,
      [alert_id, rancher_note || null]
    );

    // Mark alert as acknowledged
    await pool.query(
      'UPDATE alerts SET acknowledged = TRUE, acknowledged_at = NOW() WHERE id = $1',
      [alert_id]
    );

    // Build full notification payload
    const payload = await buildNotificationPayload(alert, pool);

    // Fetch breed for AI briefing
    const animalResult = await pool.query(
      'SELECT breed FROM animals WHERE id = $1',
      [alert.animal_id]
    );
    const breed = animalResult.rows[0]?.breed || 'Unknown';

    const ts = payload.telemetry_summary;
    const ai_briefing = await generateVetBriefing({
      animal: { ...payload.animal, breed },
      riskLevel: payload.risk_level,
      telemetrySummary: {
        avgTemp: ts.nose_ring.avg_24h_temp ?? ts.nose_ring.latest_temp_c ?? 0,
        avgRespRate: ts.nose_ring.latest_respiratory_rate ?? 0,
        avgChewFreq: ts.collar.latest_chew_frequency ?? 0,
        totalCoughs: ts.collar.latest_cough_count ?? 0,
        avgBehaviorIndex: ts.ear_tag.latest_behavior_index ?? 0,
      },
      rancherNote: rancher_note,
    });

    res.status(201).json({
      telehealth_action: { ...result.rows[0], ai_briefing },
      notification_payload: payload,
    });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Alert not found' });
    }
    console.error('Error creating telehealth action:', err);
    res.status(500).json({ error: 'Failed to create telehealth action' });
  }
});

// GET /api/telehealth
router.get('/', authenticateToken, async (req, res) => {
  const { status } = req.query;
  try {
    const whereClause = status ? `WHERE ta.status = $1` : '';
    const params = status ? [status] : [];

    const result = await pool.query(`
      SELECT
        ta.id,
        ta.alert_id,
        ta.rancher_note,
        ta.rancher_sent_at,
        ta.vet_note,
        ta.vet_action,
        ta.vet_responded_at,
        ta.status,
        ta.created_at,
        a.animal_id,
        a.current_risk,
        a.ml_score,
        an.tag_id,
        an.name
      FROM telehealth_actions ta
      JOIN alerts a ON ta.alert_id = a.id
      JOIN animals an ON a.animal_id = an.id
      ${whereClause}
      ORDER BY ta.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching telehealth actions:', err);
    res.status(500).json({ error: 'Failed to fetch telehealth actions' });
  }
});

// PATCH /api/telehealth/:id/respond
router.patch('/:id/respond', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { vet_note, vet_action } = req.body;

  if (!vet_action) {
    return res.status(400).json({ error: 'Missing required field: vet_action' });
  }

  const validActions = ['treat', 'monitor', 'dismiss', 'schedule_visit'];
  if (!validActions.includes(vet_action)) {
    return res.status(400).json({ error: `Invalid vet_action. Must be one of: ${validActions.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `UPDATE telehealth_actions
       SET vet_note = $1, vet_action = $2, vet_responded_at = NOW(), status = 'vet_responded'
       WHERE id = $3
       RETURNING id, alert_id, rancher_note, rancher_sent_at, vet_note, vet_action, vet_responded_at, status, created_at`,
      [vet_note || null, vet_action, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Telehealth action not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating telehealth action:', err);
    res.status(500).json({ error: 'Failed to update telehealth action' });
  }
});

// GET /api/telehealth/:id/payload
router.get('/:id/payload', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT ta.id, a.id as alert_id, a.animal_id, a.current_risk, a.ml_score, a.triggered_at
       FROM telehealth_actions ta
       JOIN alerts a ON ta.alert_id = a.id
       WHERE ta.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Telehealth action not found' });
    }

    const action = result.rows[0];
    const alert = {
      id: action.alert_id,
      animal_id: action.animal_id,
      current_risk: action.current_risk,
      ml_score: action.ml_score,
      triggered_at: action.triggered_at,
    };

    const payload = await buildNotificationPayload(alert, pool);
    res.json(payload);
  } catch (err) {
    console.error('Error fetching telehealth payload:', err);
    res.status(500).json({ error: 'Failed to fetch telehealth payload' });
  }
});

module.exports = router;
