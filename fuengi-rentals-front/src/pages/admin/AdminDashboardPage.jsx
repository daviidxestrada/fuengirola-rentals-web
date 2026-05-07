import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { StateMsg, StatusBadge } from "../../components";
import { getAdminApartments, getBlocks, getReservations } from "../../services";
import { formatDateShort, getApartmentImages } from "../../utils";

function AdminDashboardPage() {
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [apartmentsData, reservationsData, blocksData] = await Promise.all([
          getAdminApartments(),
          getReservations(),
          getBlocks(),
        ]);

        setApartments(apartmentsData);
        setReservations(
          [...reservationsData].sort(
            (firstItem, secondItem) => new Date(secondItem.createdAt) - new Date(firstItem.createdAt)
          )
        );
        setBlocks(blocksData);
      } catch (requestError) {
        console.error(requestError);
        setError("No se pudo cargar el resumen del panel.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(
    () => ({
      pending: reservations.filter((item) => item.status === "pending").length,
      approved: reservations.filter((item) => item.status === "approved").length,
    }),
    [reservations]
  );

  if (loading) {
    return <StateMsg kind="loading" title="Cargando panel" />;
  }

  if (error) {
    return <StateMsg kind="error" title={error} />;
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Resumen</h1>
          <p>Estado actual de apartamentos, solicitudes y bloqueos.</p>
        </div>
      </div>

      <div className="admin-cards">
        <Link className="admin-card" to="/admin/apartments">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 21V8l9-5 9 5v13" />
              <path d="M9 21v-7h6v7" />
            </svg>
          </div>
          <h3>Apartamentos</h3>
          <div className="stat">{apartments.length}</div>
          <div className="stat-sub">publicados con fotos, precio e iCal</div>
        </Link>

        <Link className="admin-card" to="/admin/reservations">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <h3>Reservas</h3>
          <div className="stat">{stats.pending}</div>
          <div className="stat-sub">pendientes de aprobar - {stats.approved} aprobadas</div>
        </Link>

        <Link className="admin-card" to="/admin/blocks">
          <div className="admin-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l14.14 14.14" />
            </svg>
          </div>
          <h3>Bloqueos</h3>
          <div className="stat">{blocks.length}</div>
          <div className="stat-sub">manuales activos en calendario</div>
        </Link>
      </div>

      <div className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>Solicitudes recientes</h2>
            <p>Ultimas reservas recibidas desde la web.</p>
          </div>
          <Link className="btn btn-secondary btn-sm" to="/admin/reservations">
            Ver todas
          </Link>
        </div>

        {reservations.length === 0 ? (
          <StateMsg kind="empty" title="No hay reservas registradas" />
        ) : (
          <div className="table-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Apartamento</th>
                  <th>Fechas</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 5).map((reservation) => {
                  const image = getApartmentImages(reservation.apartment)[0];

                  return (
                    <tr key={reservation._id}>
                      <td>
                        <div className="tbl-apartment">
                          <div className="tbl-thumb" style={{ backgroundImage: `url(${image})` }} />
                          <div>
                            <div className="tbl-name">{reservation.apartment?.title || "Apartamento eliminado"}</div>
                            <div className="tbl-sub">{reservation.apartment?.city || "Sin ciudad"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {formatDateShort(reservation.startDate)} - {formatDateShort(reservation.endDate)}
                      </td>
                      <td>{reservation.totalPrice} EUR</td>
                      <td><StatusBadge status={reservation.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboardPage;
