import EmptyState from '../ui/EmptyState.jsx';
import StudentRequestCard from './StudentRequestCard.jsx';

export default function StudentRequestsList({ requests, onEdit, onDelete }) {
  if (!requests.length) {
    return <EmptyState>Henüz dilekçe bulunmuyor.</EmptyState>;
  }

  return requests.map((request) => (
    <StudentRequestCard key={request.id} request={request} onEdit={onEdit} onDelete={onDelete} />
  ));
}
