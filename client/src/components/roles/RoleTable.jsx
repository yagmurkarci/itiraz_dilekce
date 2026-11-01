import Button from '../ui/Button.jsx';

export default function RoleTable({ roles, users, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Rol Adı</th>
            <th>Kullanıcı Sayısı</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const userCount = users.filter((user) =>
              (user.roles || [user.role]).filter(Boolean).some((item) => item.id === role.id)
            ).length;

            return (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.roleName}</td>
                <td>{userCount}</td>
                <td>
                  {role.roleName === 'Root' ? (
                    <span className="protected-user">Koruma</span>
                  ) : (
                    <Button variant="danger" onClick={() => onDelete(role)}>
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
