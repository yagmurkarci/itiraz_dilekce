import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { courseService } from '../services/course.service.js';
import { departmentService } from '../services/department.service.js';
import { userService } from '../services/user.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import CourseTable from '../components/courses/CourseTable.jsx';
import AssignmentFilters from '../components/courses/AssignmentFilters.jsx';
import AssignmentTable from '../components/courses/AssignmentTable.jsx';

export default function CoursesPage() {
  const { isManager } = useAuth();
  const { showNotification } = useNotification();

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructorId, setInstructorId] = useState('');
  const [programId, setProgramId] = useState('');

  const load = useCallback(async () => {
    try {
      const [courseData, assignmentData, academicData, departmentData] = await Promise.all([
        courseService.getAll(),
        courseService.getAssignments(),
        userService.getAcademics(),
        departmentService.getAll(),
      ]);
      setCourses(courseData);
      setAssignments(assignmentData);
      setAcademics(academicData);
      setDepartments(departmentData);
    } catch (error) {
      showNotification('error', 'Veriler Yüklenemedi', error.message);
    }
  }, [showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedProgram =
    departments.find((department) => department.id === Number(programId))?.departmentName || '';

  const filteredAssignments = assignments.filter(({ instructor, course }) => {
    if (instructorId && instructor.id !== Number(instructorId)) return false;

    if (selectedProgram) {
      const programs = (course.courseDepartments || [])
        .map((item) => item.department?.departmentName)
        .filter(Boolean);
      if (!programs.includes(selectedProgram) && course.department?.departmentName !== selectedProgram) {
        return false;
      }
    }

    return true;
  });

  async function removeCourse(id) {
    if (!window.confirm('Bu dersi silmek istiyor musunuz?')) return;

    try {
      await courseService.remove(id);
      showNotification('success', 'Ders Silindi', 'Ders kaldırıldı.');
      await load();
    } catch (error) {
      showNotification('error', 'Ders Silinemedi', error.message);
    }
  }

  async function removeAssignment(id) {
    try {
      await courseService.removeAssignment(id);
      showNotification('success', 'Atama Kaldırıldı', 'Ders-hoca ataması kaldırıldı.');
      await load();
    } catch (error) {
      showNotification('error', 'İşlem Başarısız', error.message);
    }
  }

  return (
    <Page>
      <Panel title="Ders Listesi" className="table-panel">
        <CourseTable courses={courses} canDelete={isManager} onDelete={removeCourse} />
      </Panel>

      <Panel title="Ders-Hoca Eşleştirmesi" className="form-panel">
        <AssignmentFilters
          academics={academics}
          departments={departments}
          instructorId={instructorId}
          programId={programId}
          onInstructorChange={setInstructorId}
          onProgramChange={setProgramId}
        />
        <AssignmentTable assignments={filteredAssignments} onRemove={removeAssignment} />
      </Panel>
    </Page>
  );
}
