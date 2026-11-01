import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

export default function StudentRequestCard({ request, onEdit, onDelete }) {
  const canEdit = request.status === 'PENDING' && !request.assignedTo;

  return (
    <div className="request-status-item">
      <div className="request-status-header">
        <strong>{request.title || 'Dilekçe'}</strong>
        <StatusBadge status={request.status} />
      </div>

      <div className="request-status-meta">
        {request.course?.courseName || '-'} · {request.department?.departmentName || '-'}
      </div>
      <div className="request-status-date">{formatDate(request.createdAt)}</div>

      {request.answer && <p className="request-response">Yanıt: {request.answer}</p>}
      {request.rejectionReason && (
        <p className="request-response rejection">Ret gerekçesi: {request.rejectionReason}</p>
      )}

      {request.attachments?.length ? (
        <div className="request-attachments">
          {request.attachments.map((attachment) => (
            <a key={attachment.id} href={attachment.filePath} target="_blank" rel="noopener noreferrer">
              {attachment.fileName}
            </a>
          ))}
        </div>
      ) : null}

      {canEdit && (
        <div className="request-actions">
          <Button variant="secondary" onClick={() => onEdit(request)}>
            Düzenle
          </Button>
          <Button variant="danger" onClick={() => onDelete(request.id)}>
            Sil
          </Button>
        </div>
      )}
    </div>
  );
}
