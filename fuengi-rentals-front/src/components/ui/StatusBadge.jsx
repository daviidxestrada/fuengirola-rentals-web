const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Denegada",
};

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status || "pending"}`}>
      {statusLabels[status] || status || "Pendiente"}
    </span>
  );
}

export default StatusBadge;
