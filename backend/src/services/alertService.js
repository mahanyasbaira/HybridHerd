const { predictRisk } = require('./mlClient');

async function checkAndCreateAlert(animalId, pool) {
  if (!animalId || !pool) {
    throw new Error('animalId and pool are required');
  }

  try {
    // Get ML prediction
    const prediction = await predictRisk(animalId);
    const { risk_level, probabilities, ml_score } = prediction;

    // Fetch most recent alert for this animal to get previous_risk
    const mostRecentResult = await pool.query(
      `SELECT current_risk FROM alerts
       WHERE animal_id = $1
       ORDER BY triggered_at DESC
       LIMIT 1`,
      [animalId]
    );

    const previous_risk = mostRecentResult.rows[0]?.current_risk || 'Low';

    // Fetch most recent unacknowledged alert to check if risk differs
    const unackResult = await pool.query(
      `SELECT current_risk FROM alerts
       WHERE animal_id = $1 AND acknowledged = FALSE
       ORDER BY triggered_at DESC
       LIMIT 1`,
      [animalId]
    );

    const mostRecentUnackRisk = unackResult.rows[0]?.current_risk;

    // Only create alert if risk is High AND differs from most recent unacknowledged
    if (
      risk_level === 'High' &&
      (mostRecentUnackRisk === undefined || mostRecentUnackRisk !== risk_level)
    ) {
      const result = await pool.query(
        `INSERT INTO alerts
         (animal_id, previous_risk, current_risk, ml_score, triggered_at, acknowledged)
         VALUES ($1, $2, $3, $4, NOW(), FALSE)
         RETURNING id, animal_id, previous_risk, current_risk, ml_score, triggered_at, acknowledged`,
        [animalId, previous_risk, risk_level, ml_score]
      );

      return result.rows[0];
    }

    return null;
  } catch (err) {
    throw new Error(`Failed to check and create alert for animal ${animalId}: ${err.message}`);
  }
}

async function buildNotificationPayload(alert, pool) {
  if (!alert || !alert.id || !pool) {
    throw new Error('alert and pool are required');
  }

  try {
    const animalId = alert.animal_id;

    // Fetch animal info
    const animalResult = await pool.query(
      `SELECT id, tag_id, name FROM animals WHERE id = $1`,
      [animalId]
    );

    if (animalResult.rows.length === 0) {
      throw new Error(`Animal ${animalId} not found`);
    }

    const animal = animalResult.rows[0];

    // Fetch last 72h of telemetry
    const noseRingResult = await pool.query(
      `SELECT temperature_c, respiratory_rate, recorded_at
       FROM nose_ring_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '72 hours'
       ORDER BY recorded_at DESC`,
      [animalId]
    );

    const collarResult = await pool.query(
      `SELECT chew_frequency, cough_count, recorded_at
       FROM collar_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '72 hours'
       ORDER BY recorded_at DESC`,
      [animalId]
    );

    const earTagResult = await pool.query(
      `SELECT behavior_index, recorded_at
       FROM ear_tag_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '72 hours'
       ORDER BY recorded_at DESC`,
      [animalId]
    );

    // Calculate summary stats
    const noseRingLatest = noseRingResult.rows[0];
    const collarLatest = collarResult.rows[0];
    const earTagLatest = earTagResult.rows[0];

    // Calculate 24h average for temp
    const temp24hResult = await pool.query(
      `SELECT AVG(temperature_c) as avg_temp FROM nose_ring_readings
       WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'`,
      [animalId]
    );

    const avg_24h_temp = temp24hResult.rows[0]?.avg_temp || null;

    return {
      alert_id: alert.id,
      animal: {
        id: animal.id,
        tag_id: animal.tag_id,
        name: animal.name,
      },
      risk_level: alert.current_risk,
      ml_score: alert.ml_score,
      triggered_at: alert.triggered_at,
      telemetry_summary: {
        nose_ring: {
          latest_temp_c: noseRingLatest?.temperature_c || null,
          latest_respiratory_rate: noseRingLatest?.respiratory_rate || null,
          avg_24h_temp: avg_24h_temp ? parseFloat(avg_24h_temp.toFixed(2)) : null,
        },
        collar: {
          latest_chew_frequency: collarLatest?.chew_frequency || null,
          latest_cough_count: collarLatest?.cough_count || null,
        },
        ear_tag: {
          latest_behavior_index: earTagLatest?.behavior_index || null,
        },
      },
    };
  } catch (err) {
    throw new Error(`Failed to build notification payload for alert ${alert.id}: ${err.message}`);
  }
}

module.exports = {
  checkAndCreateAlert,
  buildNotificationPayload,
};
