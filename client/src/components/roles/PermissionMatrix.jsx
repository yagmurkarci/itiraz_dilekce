import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';

export default function PermissionMatrix({ roles, endpoints, endpointRoles, selectedRoleId, onSelectRole, onSave }) {
  const [checkedIds, setCheckedIds] = useState(new Set());

  useEffect(() => {
    if (!selectedRoleId) {
      setCheckedIds(new Set());
      return;
    }

    setCheckedIds(
      new Set(
        endpointRoles
          .filter((assignment) => assignment.roleId === Number(selectedRoleId))
          .map((assignment) => assignment.endpointId)
      )
    );
  }, [selectedRoleId, endpointRoles]);

  const selectedRole = roles.find((role) => role.id === Number(selectedRoleId));
  const isRoot = selectedRole?.roleName === 'Root';

  const groups = useMemo(
    () =>
      endpoints.reduce((result, endpoint) => {
        const groupName = endpoint.routerPath || 'Diğer';
        result[groupName] ||= [];
        result[groupName].push(endpoint);
        return result;
      }, {}),
    [endpoints]
  );

  function toggle(endpointId, checked) {
    setCheckedIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(endpointId);
      else next.delete(endpointId);
      return next;
    });
  }

  return (
    <>
      <div className="field-row single">
        <Field label="Yetkileri düzenlenecek rol">
          <select value={selectedRoleId} onChange={(event) => onSelectRole(event.target.value)}>
            <option value="">Rol seçin</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.roleName}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="role-permission-list">
        {Object.entries(groups).map(([groupName, groupEndpoints]) => (
          <section className="permission-group" key={groupName}>
            <h4>{groupName}</h4>
            <div className="permission-endpoints">
              {groupEndpoints.map((endpoint) => (
                <label className="permission-item" key={endpoint.id}>
                  <input
                    type="checkbox"
                    disabled={isRoot || !selectedRole}
                    checked={checkedIds.has(endpoint.id)}
                    onChange={(event) => toggle(endpoint.id, event.target.checked)}
                  />
                  <span>
                    <strong>{endpoint.method}</strong> {endpoint.endpointPath}
                    <small>{endpoint.description || ''}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="form-actions">
        <Button
          disabled={isRoot || !selectedRole}
          onClick={() => onSave(Number(selectedRoleId), checkedIds)}
        >
          Yetkileri Kaydet
        </Button>
      </div>

      {isRoot && (
        <p className="form-message">Root rolünün tüm sistem yetkileri korunur ve değiştirilemez.</p>
      )}
    </>
  );
}
