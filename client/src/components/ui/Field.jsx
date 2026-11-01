export default function Field({ label, className = '', children }) {
  return (
    <label className={className}>
      {label && <span>{label}</span>}
      {children}
    </label>
  );
}
