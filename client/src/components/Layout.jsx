import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './layout/Sidebar.jsx';
import Header from './layout/Header.jsx';
import Main from './layout/Main.jsx';
import Footer from './layout/Footer.jsx';

const PAGE_TITLES = {
  '/': 'Ana Sayfa',
  '/requests': 'Dilekçe Takibi',
  '/student-courses': 'Derslerim',
  '/student-schedule': 'Ders Programım',
  '/courses': 'Ders Yönetimi',
  '/users': 'Kullanıcı Yönetimi',
  '/roles': 'Roller',
};

export default function Layout() {
  const { profile, roles, hasAcademicRole, isStudent, isStudentAffairs, isManager, isRoot, logout } = useAuth();
  const location = useLocation();

  const items = [{ to: '/', label: 'Ana Sayfa' }];

  if (isStudent || isStudentAffairs || isManager || hasAcademicRole) {
    items.push({
      to: '/requests',
      label: isStudent ? 'Dilekçelerim' : isStudentAffairs ? 'Dilekçe İnceleme' : 'Dilekçe Yönetimi',
    });
  }
  if (isStudent) {
    items.push({ to: '/student-courses', label: 'Derslerim' });
    items.push({ to: '/student-schedule', label: 'Ders Programım' });
  }
  if (isManager || hasAcademicRole) items.push({ to: '/courses', label: 'Ders Yönetimi' });
  if (isManager || isStudentAffairs) {
    items.push({ to: '/users', label: isStudentAffairs ? 'Öğrenci Yönetimi' : 'Kullanıcı Yönetimi' });
  }
  if (isRoot) items.push({ to: '/roles', label: 'Roller' });

  const title = PAGE_TITLES[location.pathname] || 'Ana Sayfa';
  const displayName = profile?.name || 'Kullanıcı';
  const primaryRole = roles[0] || 'Kullanıcı';

  return (
    <div className="dashboard">
      <Sidebar items={items} displayName={displayName} primaryRole={primaryRole} onLogout={logout} />
      <Main>
        <Header title={title} />
        <Outlet />
        <Footer />
      </Main>
    </div>
  );
}
