import { apiFetch } from '../api/client.js';

export const authService = {
  login: (email, password) =>
    apiFetch('/auth/Login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch('/auth/Me'),
  signUp: (payload) =>
    apiFetch('/auth/Sign-up', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
