import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context";
import { getMyReservations } from "../../services";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const statusLabels = {
  pending: "En proceso",
  approved: "Aprobada",
  rejected: "Denegada",
};

function UserAccountPage() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const data = await getMyReservations();
        setReservations(data);
      } catch (requestError) {
        console.error(requestError);
        setError("No se pudieron cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="page-eyebrow">Mi panel</p>
        <h1>Mis reservas</h1>
        <p className="page-lead">
          Aqui puedes consultar las reservas creadas con tu usuario.
        </p>
        <div>
          <button type="button" className="site-cta site-cta-secondary" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </div>

      {loading ? (
        <p className="page-feedback">Cargando tus reservas...</p>
      ) : error ? (
        <p className="page-feedback page-feedback-error">{error}</p>
      ) : reservations.length === 0 ? (
        <section className="empty-card">
          <h2>Todavia no tienes reservas</h2>
          <p>Cuando reserves un apartamento desde la web apareceran aqui.</p>
        </section>
      ) : (
        <section className="user-reservation-list">
          {reservations.map((reservation) => (
            <article key={reservation._id} className="user-reservation-card">
              <div className="admin-reservation-top">
                <h2>{reservation.apartment?.title || "Apartamento no disponible"}</h2>
                <div className="user-reservation-badges">
                  <span className="price-pill">{reservation.totalPrice} EUR</span>
                  <span className={`status-pill status-${reservation.status}`}>
                    {statusLabels[reservation.status] || reservation.status}
                  </span>
                </div>
              </div>

              <p><strong>Ciudad:</strong> {reservation.apartment?.city || "No disponible"}</p>
              <p><strong>Entrada:</strong> {formatDate(reservation.startDate)}</p>
              <p><strong>Salida:</strong> {formatDate(reservation.endDate)}</p>
              <p><strong>Reserva creada:</strong> {formatDate(reservation.createdAt)}</p>
              {reservation.status === "pending" && (
                <p>Tu solicitud esta siendo revisada por administracion.</p>
              )}
              {reservation.status === "approved" && (
                <p>Tu solicitud ha sido aprobada.</p>
              )}
              {reservation.status === "rejected" && (
                <div className="page-feedback page-feedback-error">
                  <strong>Motivo de denegacion:</strong> {reservation.rejectionReason}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </section>
  );
}

export default UserAccountPage;
