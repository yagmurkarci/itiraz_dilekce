import { apiFetch } from '../api/client.js';

export const requestService = {
  getAll: () => apiFetch('/requests/GetAllRequests'),
  getAssigned: () => apiFetch('/requests/GetAssignedRequests'),
  getByUser: (userId) => apiFetch(`/requests/GetRequestsByUser/${userId}`),
  create: (payload) =>
    apiFetch('/requests/CreateRequest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiFetch(`/requests/UpdateRequest/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiFetch(`/requests/DeleteRequest/${id}`, { method: 'DELETE' }),
  forward: (id, instructorId) =>
    apiFetch(`/requests/ForwardRequest/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ instructorId }),
    }),
  reject: (id, rejectionReason) =>
    apiFetch(`/requests/RejectRequest/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    }),
  reply: (id, answer) =>
    apiFetch(`/requests/ReplyToRequest/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ answer }),
    }),
  uploadAttachment: (file, requestId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);
    return apiFetch('/request-attachments/UploadRequestAttachment', {
      method: 'POST',
      body: formData,
    });
  },
  getAttachments: (requestId) =>
    apiFetch(`/request-attachments/GetRequestAttachments/${requestId}`),
};
