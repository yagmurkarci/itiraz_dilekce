import { useCallback, useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext.jsx';
import { permissionService, roleService } from '../services/role.service.js';
import { userService } from '../services/user.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import RoleTable from '../components/roles/RoleTable.jsx';
import PermissionMatrix from '../components/roles/PermissionMatrix.jsx';

export default function RolesPage() {
  const { showNotification } = useNotification();

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [endpointRoles, setEndpointRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const load = useCallback(async () => {
    try {
      const [roleData, userData, endpointData, endpointRoleData] = await Promise.all([
        roleService.getAll(),
        userService.getAll(),
        permissionService.getEndpoints(),
        permissionService.getEndpointRoles(),
      ]);
      setRoles(roleData);
      setUsers(userData);
      setEndpoints(endpointData);
      setEndpointRoles(endpointRoleData);
    } catch (error) {
      showNotification('error', 'Veriler Yüklenemedi', error.message);
    }
  }, [showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  async function removeRole(role) {
    if (role.roleName === 'Root') return;
    if (!window.confirm(`"${role.roleName}" rolünü silmek istiyor musunuz?`)) return;

    try {
      await roleService.remove(role.id);
      showNotification('success', 'Rol Silindi', `"${role.roleName}" rolü silindi.`);
      await load();
    } catch (error) {
      showNotification('error', 'Rol Silinemedi', error.message);
    }
  }

  async function savePermissions(roleId, checkedIds) {
    const currentAssignments = endpointRoles.filter((assignment) => assignment.roleId === roleId);
    const currentIds = new Set(currentAssignments.map((assignment) => assignment.endpointId));
    const toAdd = [...checkedIds].filter((endpointId) => !currentIds.has(endpointId));
    const toRemove = currentAssignments.filter((assignment) => !checkedIds.has(assignment.endpointId));

    try {
      await Promise.all([
        ...toAdd.map((endpointId) => permissionService.create(endpointId, roleId)),
        ...toRemove.map((assignment) => permissionService.remove(assignment.id)),
      ]);
      showNotification('success', 'Yetkiler Kaydedildi', 'Rol yetkileri güncellendi.');
      await load();
    } catch (error) {
      showNotification('error', 'Yetkiler Kaydedilemedi', error.message);
    }
  }

  return (
    <Page>
      <Panel title="Roller" className="table-panel">
        <RoleTable roles={roles} users={users} onDelete={removeRole} />
      </Panel>

      <Panel title="Rol Yetkileri" className="permissions-panel">
        <PermissionMatrix
          roles={roles}
          endpoints={endpoints}
          endpointRoles={endpointRoles}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          onSave={savePermissions}
        />
      </Panel>
    </Page>
  );
}
