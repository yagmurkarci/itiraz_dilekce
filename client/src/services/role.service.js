import { apiFetch } from '../api/client.js';

export const roleService = {
  getAll: () => apiFetch('/roles/GetAllRoles'),
  create: (roleName) =>
    apiFetch('/roles/CreateRole', {
      method: 'POST',
      body: JSON.stringify({ roleName }),
    }),
  update: (id, roleName) =>
    apiFetch(`/roles/UpdateRoleById/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ roleName }),
    }),
  remove: (id) => apiFetch(`/roles/DeleteRoleById/${id}`, { method: 'DELETE' }),
};

export const permissionService = {
  getEndpoints: () => apiFetch('/endpoints/GetAllEndpoints'),
  getEndpointRoles: () => apiFetch('/endpoint-roles/GetAllEndpointRoles'),
  create: (endpointId, roleId) =>
    apiFetch('/endpoint-roles/CreateEndpointRole', {
      method: 'POST',
      body: JSON.stringify({ endpointId, roleId }),
    }),
  remove: (id) =>
    apiFetch(`/endpoint-roles/DeleteEndpointRoleById/${id}`, { method: 'DELETE' }),
};
