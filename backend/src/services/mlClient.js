const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 5000; // 5 seconds

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function getMLHealth() {
  try {
    const response = await fetchWithTimeout(`${ML_SERVICE_URL}/health`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error('ML service health check failed:', err.message);
    return null;
  }
}

async function predictRisk(animalId, lookbackHours = 72) {
  if (!animalId) {
    throw new Error('animalId is required');
  }

  try {
    const response = await fetchWithTimeout(`${ML_SERVICE_URL}/predict-from-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_id: animalId,
        lookback_hours: lookbackHours,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ML service returned ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data; // Should contain { risk_level, probabilities, ... }
  } catch (err) {
    throw new Error(`Failed to predict risk for animal ${animalId}: ${err.message}`);
  }
}

module.exports = {
  getMLHealth,
  predictRisk,
};
