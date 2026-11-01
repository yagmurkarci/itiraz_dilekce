import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import DepartmentCheckboxGroup from './DepartmentCheckboxGroup.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  number: '',
  roleId: '',
  departmentIds: [],
};

export default function UserCreateForm({ roles, departments, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const update = (patch) => setForm((previous) => ({ ...previous, ...patch }));

  const selectedRole = roles.find((role) => role.id === Number(form.roleId));
  const isStudentRole = ['Öğrenci', 'Mezun'].includes(selectedRole?.roleName);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await onSubmit({ ...form, roleId: Number(form.roleId) });
      setForm(emptyForm);
    } catch {
      // hata üst bileşende bildirilir
    }
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
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
        <Field label="Şifre">
          <input
            type="password"
            value={form.password}
            onChange={(event) => update({ password: event.target.value })}
            required
          />
        </Field>
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
            <option value="">Rol seçin</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.roleName}
              </option>
            ))}
          </select>
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
        <Button type="submit">Kullanıcıyı Kaydet</Button>
      </div>
    </form>
  );
}
