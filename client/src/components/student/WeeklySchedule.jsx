import { formatTime } from '../../utils/format.js';

export default function WeeklySchedule({ schedule, message, error }) {
  const weeks = schedule.reduce((result, item) => {
    const start = new Date(item.start);
    const monday = new Date(start);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().slice(0, 10);
    result[key] ||= [];
    result[key].push(item);
    return result;
  }, {});

  return (
    <>
      <p className={`form-message ${error ? 'error' : 'success'}`}>{message}</p>

      {Object.entries(weeks)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([weekKey, items]) => {
          const weekStart = new Date(`${weekKey}T00:00:00`);
          const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            return date;
          });

          return (
            <section className="weekly-schedule" key={weekKey}>
              <div className="weekly-schedule-header">
                {weekStart.toLocaleDateString('tr-TR')} - {days[6].toLocaleDateString('tr-TR')}
              </div>
              <div className="weekly-schedule-grid">
                {days.map((date) => {
                  const dateKey = date.toISOString().slice(0, 10);
                  const dayItems = items
                    .filter((item) => item.start?.slice(0, 10) === dateKey)
                    .sort((first, second) => new Date(first.start) - new Date(second.start));

                  return (
                    <div className="schedule-day" key={dateKey}>
                      <div className="schedule-day-header">
                        <strong>{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</strong>
                        <span>{date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                      <div className="schedule-day-items">
                        {dayItems.length ? (
                          dayItems.map((item, index) => (
                            <article className="schedule-event" key={`${item.start}-${index}`}>
                              <strong>{item.title || 'Ders'}</strong>
                              <span>
                                {formatTime(item.start)} - {formatTime(item.end)}
                              </span>
                              <small>{item.description || 'Derslik bilgisi yok'}</small>
                            </article>
                          ))
                        ) : (
                          <span className="schedule-empty">Ders yok</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
    </>
  );
}
