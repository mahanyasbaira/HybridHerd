-- Core animal registry
CREATE TABLE animals (
  id          SERIAL PRIMARY KEY,
  tag_id      VARCHAR(50) UNIQUE NOT NULL,   -- SenseHub ear tag ID
  name        VARCHAR(100),
  breed       VARCHAR(100),
  birth_date  DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Nose ring telemetry (temperature + respiratory rate)
CREATE TABLE nose_ring_readings (
  id               BIGSERIAL PRIMARY KEY,
  animal_id        INT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  temperature_c    NUMERIC(5,2),
  respiratory_rate NUMERIC(5,2),    -- breaths per minute
  recorded_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_nose_ring_animal_time ON nose_ring_readings (animal_id, recorded_at DESC);

-- Collar telemetry (chew frequency + cough count)
CREATE TABLE collar_readings (
  id              BIGSERIAL PRIMARY KEY,
  animal_id       INT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  chew_frequency  NUMERIC(5,2),     -- chews per minute
  cough_count     INT,
  recorded_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_collar_animal_time ON collar_readings (animal_id, recorded_at DESC);

-- Ear tag / SenseHub telemetry (behavior index)
CREATE TABLE ear_tag_readings (
  id             BIGSERIAL PRIMARY KEY,
  animal_id      INT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  behavior_index NUMERIC(5,3),      -- normalized 0-1 activity score from SenseHub
  recorded_at    TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ear_tag_animal_time ON ear_tag_readings (animal_id, recorded_at DESC);

-- BRD risk alerts
CREATE TABLE alerts (
  id              SERIAL PRIMARY KEY,
  animal_id       INT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  previous_risk   VARCHAR(10) CHECK (previous_risk IN ('Low','Medium','High')),
  current_risk    VARCHAR(10) NOT NULL CHECK (current_risk IN ('Low','Medium','High')),
  ml_score        NUMERIC(5,4),     -- raw probability from ML model
  triggered_at    TIMESTAMPTZ DEFAULT NOW(),
  acknowledged    BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ
);
CREATE INDEX idx_alerts_animal ON alerts (animal_id, triggered_at DESC);

-- Telehealth workflow: rancher -> vet
CREATE TABLE telehealth_actions (
  id               SERIAL PRIMARY KEY,
  alert_id         INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  rancher_note     TEXT,
  rancher_sent_at  TIMESTAMPTZ,
  vet_note         TEXT,
  vet_action       VARCHAR(50) CHECK (vet_action IN ('treat','monitor','dismiss','schedule_visit')),
  vet_responded_at TIMESTAMPTZ,
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent_to_vet','vet_responded','closed')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
