import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import StudentCoursesPage from './pages/StudentCoursesPage.jsx';
import StudentSchedulePage from './pages/StudentSchedulePage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import RolesPage from './pages/RolesPage.jsx';

export default function App() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return (
      <div className="auth-shell">
        <div className="auth-card">Yükleniyor…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="student-courses" element={<StudentCoursesPage />} />
        <Route path="student-schedule" element={<StudentSchedulePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
