import { apiFetch } from '../api/client.js';

export const bysService = {
  studentCourses: (ogrenciId) => apiFetch(`/bys/student-courses?ogrenciId=${ogrenciId}`),
  studentSchedule: (ogrenciId) => apiFetch(`/bys/student-schedule?ogrenciId=${ogrenciId}`),
};
