import { apiFetch } from '../api/client.js';

export const courseService = {
  getAll: () => apiFetch('/courses/GetAllCourses'),
  getStudentDepartmentCourses: () => apiFetch('/courses/GetStudentDepartmentCourses'),
  getDepartmentCourseMap: () => apiFetch('/courses/GetDepartmentCourseMap'),
  create: (payload) =>
    apiFetch('/courses/CreateCourse', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiFetch(`/courses/UpdateCourseById/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiFetch(`/courses/DeleteCourseById/${id}`, { method: 'DELETE' }),
  getAssignments: () => apiFetch('/course-instructors/GetAssignments'),
  assignInstructor: (courseId, instructorId) =>
    apiFetch('/course-instructors/AssignInstructor', {
      method: 'POST',
      body: JSON.stringify({ courseId, instructorId }),
    }),
  removeAssignment: (id) =>
    apiFetch(`/course-instructors/DeleteAssignment/${id}`, { method: 'DELETE' }),
  syncFromBys: (ogrenciId) =>
    apiFetch('/course-instructors/SyncFromBys', {
      method: 'POST',
      body: JSON.stringify({ ogrenciId }),
    }),
};
