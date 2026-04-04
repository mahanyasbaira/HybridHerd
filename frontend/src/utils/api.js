import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// TODO: add JWT token to Authorization header

export async function fetchAnimals(riskFilter) {
  try {
    const params = {};
    if (riskFilter && riskFilter !== 'All') {
      params.risk = riskFilter;
    }
    const response = await api.get('/api/animals', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchAnimal(id) {
  try {
    const response = await api.get(`/api/animals/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchAlerts() {
  try {
    const response = await api.get('/api/alerts');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function sendToVet(alertId, rancherNote) {
  try {
    const response = await api.post('/api/telehealth', {
      alert_id: alertId,
      rancher_note: rancherNote,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function acknowledgeAlert(alertId) {
  try {
    const response = await api.patch(`/api/alerts/${alertId}/acknowledge`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function respondToTelehealth(id, vetNote, vetAction) {
  try {
    const response = await api.patch(`/api/telehealth/${id}/respond`, {
      vet_note: vetNote,
      vet_action: vetAction,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
