export default function Panel({ title, actions, className = '', children }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || actions) && (
        <div className="panel-header">
          {title && <h3>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
