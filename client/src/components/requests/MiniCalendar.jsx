import { useMemo, useState } from 'react';

const monthLabel = (date) =>
  new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date);

export default function MiniCalendar({ events = [] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const eventMap = useMemo(() => new Map(events.map((event) => [event.date, event])), [events]);

  const firstDayIndex = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(month.getFullYear(), month.getMonth(), 0).getDate();

  const cells = [];

  for (let index = 0; index < firstDayIndex; index += 1) {
    cells.push({ key: `prev-${index}`, label: daysInPrevMonth - firstDayIndex + index + 1, muted: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ key, label: day, event: eventMap.get(key) });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    cells.push({ key: `next-${day}`, label: day, muted: true });
  }

  const changeMonth = (delta) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div>
      <div className="mini-calendar-header">
        <button className="calendar-nav" type="button" onClick={() => changeMonth(-1)} aria-label="Önceki ay">
          ‹
        </button>
        <span>{monthLabel(month)}</span>
        <button className="calendar-nav" type="button" onClick={() => changeMonth(1)} aria-label="Sonraki ay">
          ›
        </button>
      </div>

      <div className="mini-calendar-grid">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day) => (
          <span className="day-name" key={day}>
            {day}
          </span>
        ))}

        {cells.map((cell) => (
          <span
            key={cell.key}
            className={`day${cell.muted ? ' muted' : ''}${cell.event ? ` ${cell.event.type}` : ''}`}
            title={cell.event ? `${cell.event.text}: ${cell.event.project}` : `${cell.label}.`}
          >
            {cell.label}
          </span>
        ))}
      </div>

      <div className="calendar-legend">
        <span>
          <i className="legend exam" /> Sınav
        </span>
        <span>
          <i className="legend assignment" /> Ödev
        </span>
        <span>
          <i className="legend quiz" /> Kısa sınav
        </span>
        <span>
          <i className="legend holiday" /> Tatil
        </span>
      </div>
    </div>
  );
}
