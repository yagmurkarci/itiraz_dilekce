import Button from '../ui/Button.jsx';

export default function AssignmentTable({ assignments, onRemove }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ders</th>
            <th>Program</th>
            <th>Öğretim elemanı</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length ? (
            assignments.map(({ id, course, instructor }) => {
              const programs = (course.courseDepartments || [])
                .map((item) => item.department?.departmentName)
                .filter(Boolean);
              const programText = programs.length
                ? programs.join(', ')
                : course.department?.departmentName || '-';

              return (
                <tr key={id}>
                  <td>
                    {course.courseCode} - {course.courseName}
                  </td>
                  <td>{programText}</td>
                  <td>{instructor.name}</td>
                  <td>
                    <Button variant="danger" onClick={() => onRemove(id)}>
                      Kaldır
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4}>Henüz ders-hoca eşleştirmesi yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
