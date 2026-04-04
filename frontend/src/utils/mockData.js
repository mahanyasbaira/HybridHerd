export const MOCK_ANIMALS = [
  { id: 1, tag_id: 'SH-001', name: 'Bessie', current_risk: 'High', latest_ml_score: 0.87 },
  { id: 2, tag_id: 'SH-002', name: 'Daisy', current_risk: 'Medium', latest_ml_score: 0.54 },
  { id: 3, tag_id: 'SH-003', name: 'Molly', current_risk: 'Low', latest_ml_score: 0.12 },
  { id: 4, tag_id: 'SH-004', name: 'Rosie', current_risk: 'Low', latest_ml_score: 0.08 },
  { id: 5, tag_id: 'SH-005', name: 'Clover', current_risk: 'High', latest_ml_score: 0.93 },
];

export const MOCK_ANIMAL_DETAIL = {
  id: 1,
  tag_id: 'SH-001',
  name: 'Bessie',
  current_risk: 'High',
  latest_alert_id: 42,
  nose_ring: { temperature_c: 40.1, respiratory_rate: 58 },
  collar: { chew_frequency: 28, cough_count: 7 },
  ear_tag: { behavior_index: 0.22 },
};
