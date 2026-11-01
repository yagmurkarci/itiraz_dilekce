import Button from '../ui/Button.jsx';

export default function CourseTable({ courses, canDelete, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ders Kodu</th>
            <th>Ders Adı</th>
            <th>Program</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const programs = (course.courseDepartments || [])
              .map((item) => item.department?.departmentName)
              .filter(Boolean);
            const programText = programs.length
              ? programs.join(', ')
              : course.department?.departmentName || '-';

            return (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.courseCode}</td>
                <td>{course.courseName}</td>
                <td>{programText}</td>
                <td>
                  {canDelete && (
                    <Button variant="danger" onClick={() => onDelete(course.id)}>
                      Sil
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
