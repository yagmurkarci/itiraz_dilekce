import { NavLink } from 'react-router-dom';

export default function Sidebar({ items, displayName, primaryRole, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark small">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{displayName}</strong>
          <small>{primaryRole}</small>
        </div>
      </div>

      <nav className="nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button className="logout-button" type="button" onClick={onLogout}>
        Çıkış
      </button>
    </aside>
  );
}
