import { getRequestStatusLabel } from '../../utils/format.js';

export default function StatusBadge({ status }) {
  return <span className="request-status-badge">{getRequestStatusLabel(status)}</span>;
}
