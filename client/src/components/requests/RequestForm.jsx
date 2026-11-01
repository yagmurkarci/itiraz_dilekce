import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';

const emptyForm = { courseId: '', title: '', description: '', file: null };

export default function RequestForm({ courses, initial, editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);

  useEffect(() => {
    setForm(initial || emptyForm);
  }, [initial]);

  const update = (patch) => setForm((previous) => ({ ...previous, ...patch }));

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <Field label="Ders">
          <select
            value={form.courseId}
            onChange={(event) => update({ courseId: event.target.value })}
            required
          >
            <option value="">Ders seçin</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Konu">
          <input
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Sınav kağıdı itirazı"
            required
          />
        </Field>
      </div>

      <Field label="Detay">
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="İtiraz nedeninizi açıklayın…"
          required
        />
      </Field>

      <Field label="Ek Dosya">
        <input
          type="file"
          onChange={(event) => update({ file: event.target.files?.[0] || null })}
        />
      </Field>

      <div className="form-actions">
        <Button type="submit">{editing ? 'Değişiklikleri Kaydet' : 'Dilekçe Gönder'}</Button>
        {editing && (
          <Button variant="secondary" onClick={onCancel}>
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}
