export default function Header({ title }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Panel</p>
        <h2>{title}</h2>
      </div>
      <div className="status-pill">Aktif</div>
    </header>
  );
}
