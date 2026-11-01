import { formatDate, getRequestStatusLabel } from '../../utils/format.js';
import ForwardRejectForm from './ForwardRejectForm.jsx';
import InstructorReplyForm from './InstructorReplyForm.jsx';

export default function StaffRequestRow({ request, userId, hasAcademicRole, canManage, onForward, onReject, onReply }) {
  const isClosed = request.status === 'REJECTED' || request.status === 'ANSWERED';
  const canReply = hasAcademicRole && Number(request.assignedTo) === userId;

  let actionContent;

  if (isClosed) {
    actionContent = (
      <div className="request-status-date">
        {getRequestStatusLabel(request.status)}
        {request.rejectionReason ? <small>{request.rejectionReason}</small> : null}
      </div>
    );
  } else if (canReply) {
    actionContent = (
      <InstructorReplyForm
        attachments={request.attachments}
        onReply={(file, answer) => onReply(request.id, file, answer)}
      />
    );
  } else if (canManage) {
    actionContent = (
      <ForwardRejectForm
        instructors={request.course?.instructors || []}
        onForward={(instructorId) => onForward(request.id, instructorId)}
        onReject={(reason) => onReject(request.id, reason)}
      />
    );
  } else {
    actionContent = <div className="request-status-date">Öğrenci İşleri yönlendirmesi bekleniyor</div>;
  }

  return (
    <tr>
      <td>{request.creator?.name || '-'}</td>
      <td>
        <strong>{request.title}</strong>
        <small>{request.description}</small>
      </td>
      <td>
        {request.course?.courseName || '-'}
        <small>{request.department?.departmentName || '-'}</small>
      </td>
      <td>{formatDate(request.createdAt)}</td>
      <td>{actionContent}</td>
    </tr>
  );
}
