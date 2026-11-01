import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bysService } from '../services/bys.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import WeeklySchedule from '../components/student/WeeklySchedule.jsx';

export default function StudentSchedulePage() {
  const { profile } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState('Ders programı BYS üzerinden yükleniyor…');
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
        const data = await bysService.studentSchedule(profile.bysStudentId);
        if (!active) return;
        setSchedule(data.program || []);
        setMessage(`${(data.program || []).length} program kaydı BYS'den yüklendi.`);
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
      <Panel title="Haftalık Ders Programım">
        <WeeklySchedule schedule={schedule} message={message} error={error} />
      </Panel>
    </Page>
  );
}
