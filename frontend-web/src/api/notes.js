import api from './client';

export const getNotes = (animalId) =>
  api.get(`/api/notes/${animalId}`);

export const createNote = (animalId, note) =>
  api.post(`/api/notes/${animalId}`, { note });

export const updateNote = (id, note) =>
  api.patch(`/api/notes/entry/${id}`, { note });

export const deleteNote = (id) =>
  api.delete(`/api/notes/entry/${id}`);

export const sendToVet = (alertId, notes) =>
  api.post('/api/telehealth/send', { alert_id: alertId, notes });
