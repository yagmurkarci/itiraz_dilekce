import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bysService } from '../services/bys.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import BysCourseList from '../components/student/BysCourseList.jsx';

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('Dersler BYS üzerinden yükleniyor…');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!profile?.bysStudentId) {
        setMessage('Bu kullanıcı için BYS öğrenci ID tanımlanmamış.');
        setError(true);
        return;
      }

      try {
        const data = await bysService.studentCourses(profile.bysStudentId);
        if (!active) return;
        setCourses(data.dersler || []);
        setMessage(`${(data.dersler || []).length} ders BYS'den yüklendi.`);
        setError(false);
      } catch (err) {
        if (!active) return;
        setMessage(err.message);
        setError(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <Page>
      <Panel title="BYS Derslerim">
        <BysCourseList courses={courses} message={message} error={error} />
      </Panel>
    </Page>
  );
}
