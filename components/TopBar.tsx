export default function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bb-topbar">
      <div className="bb-topbar-copy">
        <div className="bb-topbar-eyebrow">SAR ResourceOS</div>
        <h1 className="bb-topbar-title">{title}</h1>
        <p className="bb-topbar-subtitle">{subtitle}</p>
      </div>

      <div className="bb-user-card">
        <div className="bb-user-role">Operator Profile</div>
        <div className="bb-user-name">Siyanda Luthuli</div>
        <div className="bb-user-org">Shobane African Resources</div>
      </div>
    </div>
  );
}
