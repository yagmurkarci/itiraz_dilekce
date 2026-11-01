import Button from '../ui/Button.jsx';

export default function UserTable({ users, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Telefon</th>
            <th>Programlar</th>
            <th>Rol</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.number || '-'}</td>
              <td>
                {(user.departments || []).map((department) => department.departmentName).join(', ') || '-'}
              </td>
              <td>
                {(user.roles || [user.role])
                  .filter(Boolean)
                  .map((item) => item.roleName)
                  .join(', ') || '-'}
              </td>
              <td>
                {user.role?.roleName === 'Root' ? (
                  <span className="protected-user">Koruma</span>
                ) : (
                  <Button variant="danger" onClick={() => onDelete(user.id)}>
                    Sil
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
