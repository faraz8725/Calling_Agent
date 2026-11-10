
function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export default StatCard;
