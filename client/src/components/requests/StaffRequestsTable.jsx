import StaffRequestRow from './StaffRequestRow.jsx';

export default function StaffRequestsTable({
  requests,
  userId,
  hasAcademicRole,
  canManage,
  onForward,
  onReject,
  onReply,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Öğrenci</th>
            <th>Konu</th>
            <th>Ders / Program</th>
            <th>Tarih</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {requests.length ? (
            requests.map((request) => (
              <StaffRequestRow
                key={request.id}
                request={request}
                userId={userId}
                hasAcademicRole={hasAcademicRole}
                canManage={canManage}
                onForward={onForward}
                onReject={onReject}
                onReply={onReply}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5}>İncelenecek dilekçe bulunmuyor.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
