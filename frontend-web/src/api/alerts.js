import api from './client';

export const getAlerts = (acknowledged = null) => {
  const params = {};
  if (acknowledged !== null) {
    params.acknowledged = acknowledged;
  }
  return api.get('/api/alerts', { params });
};

export const acknowledgeAlert = (id) =>
  api.patch(`/api/alerts/${id}/acknowledge`);
