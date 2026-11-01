import EmptyState from '../ui/EmptyState.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

export default function AnnouncementList({ requests }) {
  if (!requests.length) {
    return <EmptyState>Henüz duyuru bulunmuyor.</EmptyState>;
  }

  return requests.map((request) => (
    <div className="announcement-item" key={request.id}>
      <div className="announcement-head">
        <strong>{request.title || 'Dilekçe'}</strong>
        <StatusBadge status={request.status} />
      </div>
      <div className="announcement-body">
        {request.course?.courseName || '-'} · {formatDate(request.createdAt)}
      </div>
    </div>
  ));
}
