import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { departmentService } from '../services/department.service.js';
import { roleService } from '../services/role.service.js';
import { userService } from '../services/user.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import UserCreateForm from '../components/users/UserCreateForm.jsx';
import UserUpdateForm from '../components/users/UserUpdateForm.jsx';
import UserTable from '../components/users/UserTable.jsx';

export default function UsersPage() {
  const { isStudentAffairs } = useAuth();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const load = useCallback(async () => {
    try {
      const [userData, roleData, departmentData] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
        departmentService.getAll(),
      ]);
      setUsers(userData);
      setRoles(roleData);
      setDepartments(departmentData);
    } catch (error) {
      showNotification('error', 'Veriler Yüklenemedi', error.message);
    }
  }, [showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleRoles = roles.filter((role) => {
    if (role.roleName === 'Root') return false;
    if (isStudentAffairs) return ['Öğrenci', 'Mezun'].includes(role.roleName);
    return true;
  });

  async function createUser(form) {
    try {
      await userService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        number: form.number.trim(),
        roleId: form.roleId,
        departmentIds: form.departmentIds,
        bysStudentId: null,
      });
      showNotification('success', 'Kullanıcı Eklendi', 'Kullanıcı başarıyla oluşturuldu.');
      await load();
    } catch (error) {
      showNotification('error', 'Kullanıcı Eklenemedi', error.message);
      throw error;
    }
  }

  async function updateUser(id, form) {
    const existing = users.find((user) => user.id === id);

    try {
      await userService.update(id, {
        name: form.name.trim(),
        email: form.email.trim(),
        number: form.number.trim(),
        roleId: form.roleId,
        departmentIds: form.departmentIds,
        bysStudentId: existing?.bysStudentId ?? null,
        ...(form.password ? { password: form.password } : {}),
      });
      showNotification('success', 'Kullanıcı Güncellendi', 'Kullanıcı başarıyla güncellendi.');
      await load();
    } catch (error) {
      showNotification('error', 'Kullanıcı Güncellenemedi', error.message);
      throw error;
    }
  }

  async function removeUser(id) {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      await userService.remove(id);
      showNotification('success', 'Kullanıcı Silindi', 'Kullanıcı kaldırıldı.');
      await load();
    } catch (error) {
      showNotification('error', 'Kullanıcı Silinemedi', error.message);
    }
  }

  return (
    <Page>
      <Panel title="Yeni Kullanıcı Ekle" className="form-panel">
        <UserCreateForm roles={visibleRoles} departments={departments} onSubmit={createUser} />
      </Panel>

      <Panel title="Mevcut Kullanıcıyı Güncelle" className="form-panel">
        <UserUpdateForm users={users} roles={visibleRoles} departments={departments} onSubmit={updateUser} />
      </Panel>

      <Panel title="Kullanıcılar" className="table-panel">
        <UserTable users={users} onDelete={removeUser} />
      </Panel>
    </Page>
  );
}
