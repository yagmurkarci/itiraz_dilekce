import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ForwardRejectForm({ instructors = [], onForward, onReject }) {
  const [instructorId, setInstructorId] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="request-review-cell">
      <select value={instructorId} onChange={(event) => setInstructorId(event.target.value)}>
        <option value="">Atanmış hocayı seçin</option>
        {instructors.map(({ instructor }) => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.name}
          </option>
        ))}
      </select>

      <textarea
        rows={2}
        placeholder="Ret gerekçesi"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />

      <Button variant="secondary" onClick={() => onForward(instructorId)}>
        Hocaya yönlendir
      </Button>
      <Button variant="danger" onClick={() => onReject(reason)}>
        Gerekçeli reddet
      </Button>
    </div>
  );
}
