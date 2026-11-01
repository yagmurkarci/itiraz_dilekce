import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';

export default function InstructorReplyForm({ attachments = [], onReply }) {
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState('');

  return (
    <div className="request-review-cell">
      <div className="request-attachments">
        Öğrenci ekleri:
        <br />
        {attachments.length
          ? attachments.map((attachment) => (
              <a key={attachment.id} href={attachment.filePath} target="_blank" rel="noopener noreferrer">
                {attachment.fileName}
              </a>
            ))
          : 'Ek dosya yok'}
      </div>

      <Field label="İncelenmiş sınav kağıdı (PDF/görsel)">
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </Field>

      <textarea
        rows={3}
        placeholder="İnceleme yanıtı"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />

      <Button small onClick={() => onReply(file, answer)}>
        Dosyayı yükle ve yanıtla
      </Button>
    </div>
  );
}
