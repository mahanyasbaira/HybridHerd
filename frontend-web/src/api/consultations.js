import api from './client';

export const createConsultation = (data) =>
  api.post('/api/consultations', data).then((r) => r.data);

export const getConsultations = () =>
  api.get('/api/consultations').then((r) => r.data);

export const getConsultationsByAnimal = (animalId) =>
  api.get(`/api/consultations/animal/${animalId}`).then((r) => r.data);

export const updateConsultationStatus = (id, status) =>
  api.patch(`/api/consultations/${id}/status`, { status }).then((r) => r.data);
