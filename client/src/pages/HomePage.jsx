import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { courseService } from '../services/course.service.js';
import { departmentService } from '../services/department.service.js';
import { requestService } from '../services/request.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import AnnouncementList from '../components/home/AnnouncementList.jsx';
import StatCards from '../components/home/StatCards.jsx';
import MiniCalendar from '../components/requests/MiniCalendar.jsx';

export default function HomePage() {
  const { isStudent, userId } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const [courseData, departmentData] = await Promise.all([
        courseService.getAll().catch(() => []),
        departmentService.getAll().catch(() => []),
      ]);

      if (!active) return;
      setCourses(courseData);
      setDepartments(departmentData);

      if (isStudent && userId) {
        const requestData = await requestService.getByUser(userId).catch(() => []);
        if (active) setRequests(requestData);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isStudent, userId]);

  const recentRequests = [...requests]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, 4);

  return (
    <Page>
      <Panel title={isStudent ? 'Duyurular' : 'Genel Bakış'}>
        {isStudent ? (
          <AnnouncementList requests={recentRequests} />
        ) : (
          <StatCards courses={courses} departments={departments} />
        )}
      </Panel>

      {isStudent && (
        <Panel title="Akademik Takvim">
          <MiniCalendar />
        </Panel>
      )}
    </Page>
  );
}
