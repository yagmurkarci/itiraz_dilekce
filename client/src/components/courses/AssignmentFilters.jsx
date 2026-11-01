import Field from '../ui/Field.jsx';

export default function AssignmentFilters({
  academics,
  departments,
  instructorId,
  programId,
  onInstructorChange,
  onProgramChange,
}) {
  return (
    <div className="field-row">
      <Field label="Hoca">
        <select value={instructorId} onChange={(event) => onInstructorChange(event.target.value)}>
          <option value="">Tümü</option>
          {academics.map((academic) => (
            <option key={academic.id} value={academic.id}>
              {academic.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Program">
        <select value={programId} onChange={(event) => onProgramChange(event.target.value)}>
          <option value="">Tüm programlar</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.departmentName}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
