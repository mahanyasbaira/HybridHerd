import api from './client';

export const getAnimals = (risk = 'All') =>
  api.get('/api/animals', { params: { risk } });

export const getAnimalById = (id) =>
  api.get(`/api/animals/${id}`);

export const createAnimal = (data) =>
  api.post('/api/animals', data);

export const toggleAnimalFlag = (id) =>
  api.patch(`/api/animals/${id}/flag`);

export const deleteAnimal = (id) =>
  api.delete(`/api/animals/${id}`);
