import api from './client';

export const createConsultation = (data) =>
  api.post('/consultations', data).then((r) => r.data);

export const getConsultations = () =>
  api.get('/consultations').then((r) => r.data);

export const getConsultationsByAnimal = (animalId) =>
  api.get(`/consultations/animal/${animalId}`).then((r) => r.data);

export const updateConsultationStatus = (id, status) =>
  api.patch(`/consultations/${id}/status`, { status }).then((r) => r.data);
