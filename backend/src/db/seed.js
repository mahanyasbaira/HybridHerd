require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const animals = [
  { name: 'Bessie', tag_id: 'TAG-001', breed: 'Angus', risk: 'High', birth_date: '2021-03-15' },
  { name: 'Luna', tag_id: 'TAG-002', breed: 'Hereford', risk: 'Medium', birth_date: '2020-07-22' },
  { name: 'Daisy', tag_id: 'TAG-003', breed: 'Holstein', risk: 'Low', birth_date: '2022-01-10' },
  { name: 'Rosie', tag_id: 'TAG-004', breed: 'Angus', risk: 'High', birth_date: '2019-11-05' },
  { name: 'Molly', tag_id: 'TAG-005', breed: 'Simmental', risk: 'Low', birth_date: '2021-08-30' },
  { name: 'Clara', tag_id: 'TAG-006', breed: 'Holstein', risk: 'Medium', birth_date: '2020-04-18' },
  { name: 'Bella', tag_id: 'TAG-007', breed: 'Hereford', risk: 'Low', birth_date: '2022-06-12' },
  { name: 'Scout', tag_id: 'TAG-008', breed: 'Angus', risk: 'High', birth_date: '2021-01-25' },
];

function getTelemetryValues(risk) {
  const isHighRisk = risk === 'High';
  return {
    nose_ring: {
      temperature_c: isHighRisk ? 39.8 + (Math.random() - 0.5) * 0.8 : 38.5 + (Math.random() - 0.5) * 0.6,
      respiratory_rate: isHighRisk ? 48 + (Math.random() - 0.5) * 16 : 26 + (Math.random() - 0.5) * 8,
    },
    collar: {
      chew_frequency: isHighRisk ? 30 + (Math.random() - 0.5) * 20 : 65 + (Math.random() - 0.5) * 20,
      cough_count: isHighRisk ? Math.floor(8 + (Math.random() - 0.5) * 8) : Math.floor(1 + (Math.random() - 0.5) * 2),
      activity_index: isHighRisk ? 35 + (Math.random() - 0.5) * 30 : 70 + (Math.random() - 0.5) * 30,
    },
    ear_tag: {
      behavior_index: isHighRisk ? 35 + (Math.random() - 0.5) * 30 : 75 + (Math.random() - 0.5) * 20,
      rumination_minutes: isHighRisk ? 200 + (Math.random() - 0.5) * 160 : 450 + (Math.random() - 0.5) * 100,
    },
  };
}

async function seed() {
  try {
    // 1. Create demo rancher user
    const passwordHash = await bcrypt.hash('HybridHerd2024!', 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Demo Rancher', 'rancher@hybridherd.com', $1, 'rancher')
       ON CONFLICT (email) DO NOTHING`,
      [passwordHash]
    );

    // 2. Insert animals
    const animalMap = {};
    for (const animal of animals) {
      const result = await pool.query(
        `INSERT INTO animals (tag_id, name, breed, birth_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tag_id) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [animal.tag_id, animal.name, animal.breed, animal.birth_date]
      );
      animalMap[animal.tag_id] = { id: result.rows[0].id, risk: animal.risk };
    }

    // 3. Insert telemetry readings (24 readings per animal, one per hour)
    for (const [tag_id, { id: animal_id, risk }] of Object.entries(animalMap)) {
      const telemetry = getTelemetryValues(risk);
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date();
        recordedAt.setHours(recordedAt.getHours() - (23 - i));

        await pool.query(
          `INSERT INTO nose_ring_readings (animal_id, temperature_c, respiratory_rate, recorded_at)
           VALUES ($1, $2, $3, $4)`,
          [animal_id, telemetry.nose_ring.temperature_c, telemetry.nose_ring.respiratory_rate, recordedAt]
        );

        await pool.query(
          `INSERT INTO collar_readings (animal_id, chew_frequency, cough_count, recorded_at)
           VALUES ($1, $2, $3, $4)`,
          [
            animal_id,
            telemetry.collar.chew_frequency,
            telemetry.collar.cough_count,
            recordedAt,
          ]
        );

        await pool.query(
          `INSERT INTO ear_tag_readings (animal_id, behavior_index, recorded_at)
           VALUES ($1, $2, $3)`,
          [animal_id, telemetry.ear_tag.behavior_index, recordedAt]
        );
      }
    }

    // 4. Insert alerts for High-risk animals
    const highRiskAnimals = animals.filter((a) => a.risk === 'High');
    for (const animal of highRiskAnimals) {
      const animalId = animalMap[animal.tag_id].id;
      await pool.query(
        `INSERT INTO alerts (animal_id, previous_risk, current_risk, acknowledged)
         VALUES ($1, 'Low', 'High', false)`,
        [animalId]
      );
    }

    await pool.end();
  } catch (err) {
    process.exit(1);
  }
}

seed();
