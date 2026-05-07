import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { StateMsg, StatusBadge } from "../../components";
import { AuthContext } from "../../context";
import { getMyReservations } from "../../services";
import { formatDateShort, getApartmentImages } from "../../utils";

function getInitials(user) {
  return (user?.name || user?.email || "FR")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserAccountPage() {
  const { user, logout } = useContext(AuthContext);
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

  const stats = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((item) => item.status === "pending").length,
      approved: reservations.filter((item) => item.status === "approved").length,
    }),
    [reservations]
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="page-head container">
        <span className="section-kicker">Mi panel</span>
        <h1>Mis reservas</h1>
        <p>Aqui puedes consultar las solicitudes creadas con tu cuenta.</p>
      </div>

      <div className="container acct-grid">
        <aside className="acct-side">
          <div className="acct-avatar">{getInitials(user)}</div>
          <h3>{user?.name || "Usuario"}</h3>
          <div className="email">{user?.email}</div>
          <hr />
          <div className="acct-stat">
            <span>Total</span>
            <span>{stats.total}</span>
          </div>
          <div className="acct-stat">
            <span>Pendientes</span>
            <span>{stats.pending}</span>
          </div>
          <div className="acct-stat">
            <span>Aprobadas</span>
            <span>{stats.approved}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </aside>

        <section>
          {loading ? (
            <StateMsg kind="loading" title="Cargando tus reservas" />
          ) : error ? (
            <StateMsg kind="error" title={error} />
          ) : reservations.length === 0 ? (
            <StateMsg
              kind="empty"
              title="Todavia no tienes reservas"
              desc="Cuando solicites un apartamento desde la web aparecera aqui."
              action={
                <Link to="/apartments" className="btn btn-accent">
                  Ver apartamentos
                </Link>
              }
            />
          ) : (
            <div className="res-list">
              {reservations.map((reservation) => {
                const image = getApartmentImages(reservation.apartment)[0];

                return (
                  <article key={reservation._id} className="res-card">
                    <div className="res-card-img" style={{ backgroundImage: `url(${image})` }} />
                    <div className="res-card-info">
                      <h4>{reservation.apartment?.title || "Apartamento no disponible"}</h4>
                      <div className="dates">
                        {formatDateShort(reservation.startDate)} - {formatDateShort(reservation.endDate)}
                      </div>
                      {reservation.status === "pending" ? (
                        <p className="reason neutral">Tu solicitud esta siendo revisada.</p>
                      ) : null}
                      {reservation.status === "rejected" && reservation.rejectionReason ? (
                        <p className="reason">Motivo: {reservation.rejectionReason}</p>
                      ) : null}
                    </div>
                    <div className="res-card-side">
                      <StatusBadge status={reservation.status} />
                      <div className="res-card-price">{reservation.totalPrice} EUR</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default UserAccountPage;
