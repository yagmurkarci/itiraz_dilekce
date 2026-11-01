import { apiFetch } from '../api/client.js';

export const userService = {
  getAll: () => apiFetch('/users/GetAllUsers'),
  getAcademics: () => apiFetch('/users/GetAcademics'),
  create: (payload) =>
    apiFetch('/users/CreateUser', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiFetch(`/users/UpdateUserById/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiFetch(`/users/DeleteUserById/${id}`, { method: 'DELETE' }),
};
