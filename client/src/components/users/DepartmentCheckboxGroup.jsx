export default function DepartmentCheckboxGroup({ departments, selected, onChange }) {
  return (
    <div className="department-checkbox-list">
      {departments.map((department) => (
        <label className="department-checkbox-item" key={department.id}>
          <input
            type="checkbox"
            checked={selected.includes(department.id)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selected, department.id]
                  : selected.filter((id) => id !== department.id)
              )
            }
          />
          <span>{department.departmentName}</span>
        </label>
      ))}
    </div>
  );
}
