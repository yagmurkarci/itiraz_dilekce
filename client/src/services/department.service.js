import { apiFetch } from '../api/client.js';

export const departmentService = {
  getAll: () => apiFetch('/departments/GetAllDepartments'),
  create: (departmentName) =>
    apiFetch('/departments/CreateDepartment', {
      method: 'POST',
      body: JSON.stringify({ departmentName }),
    }),
  update: (id, departmentName) =>
    apiFetch(`/departments/UpdateDepartmentById/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ departmentName }),
    }),
  remove: (id) =>
    apiFetch(`/departments/DeleteDepartmentById/${id}`, { method: 'DELETE' }),
};
