const pool = require('../db/pool');

const resolvers = {
  Query: {
    animals: async (parent, args) => {
      try {
        let query = `
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
        `;

        const result = await pool.query(query);
        return result.rows;
      } catch (err) {
        console.error('Error fetching animals:', err);
        throw err;
      }
    },

    animal: async (parent, args) => {
      try {
        const { id } = args;
        const result = await pool.query(
          `SELECT id, tag_id, name, breed, birth_date, created_at FROM animals WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return null;
        }

        return result.rows[0];
      } catch (err) {
        console.error('Error fetching animal:', err);
        throw err;
      }
    },

    alerts: async (parent, args) => {
      try {
        let query = `
          SELECT
            a.id,
            a.animal_id,
            a.previous_risk,
            a.current_risk,
            a.ml_score,
            a.triggered_at,
            a.acknowledged,
            a.acknowledged_at
          FROM alerts a
        `;

        const params = [];
        if (args.acknowledged !== undefined) {
          query += ` WHERE a.acknowledged = $1`;
          params.push(args.acknowledged);
        }

        query += ` ORDER BY a.triggered_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
      } catch (err) {
        console.error('Error fetching alerts:', err);
        throw err;
      }
    },

    telehealthActions: async (parent, args) => {
      try {
        let query = `
          SELECT
            ta.id,
            ta.alert_id,
            ta.rancher_note,
            ta.rancher_sent_at,
            ta.vet_note,
            ta.vet_action,
            ta.vet_responded_at,
            ta.status,
            ta.created_at
          FROM telehealth_actions ta
        `;

        const params = [];
        if (args.status) {
          query += ` WHERE ta.status = $1`;
          params.push(args.status);
        }

        query += ` ORDER BY ta.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
      } catch (err) {
        console.error('Error fetching telehealth actions:', err);
        throw err;
      }
    },
  },

  Animal: {
    latestAlert: async (parent) => {
      try {
        const result = await pool.query(
          `SELECT id, animal_id, previous_risk, current_risk, ml_score, triggered_at, acknowledged, acknowledged_at
           FROM alerts WHERE animal_id = $1 ORDER BY triggered_at DESC LIMIT 1`,
          [parent.id]
        );
        return result.rows[0] || null;
      } catch (err) {
        console.error('Error fetching latest alert:', err);
        throw err;
      }
    },

    recentTelemetry: async (parent) => {
      try {
        const noseRingResult = await pool.query(
          `SELECT id, temperature_c, respiratory_rate, recorded_at, created_at
           FROM nose_ring_readings
           WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
           ORDER BY recorded_at DESC`,
          [parent.id]
        );

        const collarResult = await pool.query(
          `SELECT id, chew_frequency, cough_count, recorded_at, created_at
           FROM collar_readings
           WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
           ORDER BY recorded_at DESC`,
          [parent.id]
        );

        const earTagResult = await pool.query(
          `SELECT id, behavior_index, recorded_at, created_at
           FROM ear_tag_readings
           WHERE animal_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours'
           ORDER BY recorded_at DESC`,
          [parent.id]
        );

        return {
          noseRing: noseRingResult.rows,
          collar: collarResult.rows,
          earTag: earTagResult.rows,
        };
      } catch (err) {
        console.error('Error fetching recent telemetry:', err);
        throw err;
      }
    },
  },

  Alert: {
    animal: async (parent) => {
      try {
        const result = await pool.query(
          `SELECT id, tag_id, name, breed, birth_date, created_at FROM animals WHERE id = $1`,
          [parent.animal_id]
        );
        return result.rows[0] || null;
      } catch (err) {
        console.error('Error fetching animal for alert:', err);
        throw err;
      }
    },

    telehealthAction: async (parent) => {
      try {
        const result = await pool.query(
          `SELECT id, alert_id, rancher_note, rancher_sent_at, vet_note, vet_action, vet_responded_at, status, created_at
           FROM telehealth_actions WHERE alert_id = $1 LIMIT 1`,
          [parent.id]
        );
        return result.rows[0] || null;
      } catch (err) {
        console.error('Error fetching telehealth action for alert:', err);
        throw err;
      }
    },
  },
};

module.exports = resolvers;
