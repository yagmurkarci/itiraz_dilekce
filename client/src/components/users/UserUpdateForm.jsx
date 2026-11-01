import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import DepartmentCheckboxGroup from './DepartmentCheckboxGroup.jsx';

const emptyUpdate = {
  name: '',
  email: '',
  number: '',
  roleId: '',
  departmentIds: [],
  password: '',
};

export default function UserUpdateForm({ users, roles, departments, onSubmit }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!selectedUserId) {
      setForm(null);
      return;
    }

    const user = users.find((item) => item.id === Number(selectedUserId));
    if (!user) {
      setForm(null);
      return;
    }

    setForm({
      name: user.name,
      email: user.email,
      number: user.number || '',
      roleId: String(user.role?.id || ''),
      departmentIds: (user.departments || []).map((department) => department.id),
      password: '',
    });
  }, [selectedUserId, users]);

  const update = (patch) => setForm((previous) => ({ ...previous, ...patch }));
  const selectedRole = roles.find((role) => role.id === Number(form?.roleId));
  const isStudentRole = ['Öğrenci', 'Mezun'].includes(selectedRole?.roleName);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form || !selectedUserId) return;

    try {
      await onSubmit(Number(selectedUserId), { ...form, roleId: Number(form.roleId) });
      setSelectedUserId('');
      setForm(null);
    } catch {
      // hata üst bileşende bildirilir
    }
  }

  return (
    <div className="course-form">
      <div className="field-row single">
        <Field label="Kullanıcı">
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            <option value="">Kullanıcı seçin</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {form && (
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <Field label="Ad Soyad">
              <input value={form.name} onChange={(event) => update({ name: event.target.value })} required />
            </Field>
            <Field label="E-posta">
              <input
                type="email"
                value={form.email}
                onChange={(event) => update({ email: event.target.value })}
                required
              />
            </Field>
          </div>

          <div className="field-row">
            <Field label="Telefon / Numara">
              <input
                type="tel"
                value={form.number}
                onChange={(event) => update({ number: event.target.value })}
              />
            </Field>
            <Field label="Rol">
              <select
                value={form.roleId}
                onChange={(event) => update({ roleId: event.target.value })}
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Yeni Şifre (boş bırakılabilir)">
              <input
                type="password"
                value={form.password}
                onChange={(event) => update({ password: event.target.value })}
              />
            </Field>
          </div>

          {isStudentRole && (
            <div className="field-row single">
              <Field label="Öğrencinin Programları">
                <DepartmentCheckboxGroup
                  departments={departments}
                  selected={form.departmentIds}
                  onChange={(departmentIds) => update({ departmentIds })}
                />
              </Field>
            </div>
          )}

          <div className="form-actions">
            <Button type="submit">Güncelle</Button>
          </div>
        </form>
      )}
    </div>
  );
}
