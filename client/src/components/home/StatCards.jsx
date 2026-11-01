export default function StatCards({ courses, departments }) {
  return (
    <div className="home-stats">
      <div className="stat-card">
        <span>Toplam Ders</span>
        <strong>{courses.length}</strong>
      </div>
      <div className="stat-card">
        <span>Toplam Program</span>
        <strong>{departments.length}</strong>
      </div>
    </div>
  );
}
