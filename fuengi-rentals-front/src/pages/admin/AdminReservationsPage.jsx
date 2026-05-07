import { useEffect, useState } from "react";

import { deleteReservation, getReservations, updateReservationStatus } from "../../services";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Denegada",
};

function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [reasons, setReasons] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getReservations();
      const sortedReservations = [...data].sort(
        (firstReservation, secondReservation) =>
          new Date(secondReservation.createdAt) - new Date(firstReservation.createdAt)
      );
      setReservations(sortedReservations);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las reservas del panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleReasonChange = (reservationId, value) => {
    setReasons((currentReasons) => ({
      ...currentReasons,
      [reservationId]: value,
    }));
  };

  const handleApprove = async (reservationId) => {
    try {
      setProcessingId(reservationId);
      setError("");
      setMessage("");
      const updatedReservation = await updateReservationStatus(reservationId, {
        status: "approved",
      });

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === reservationId ? updatedReservation : reservation
        )
      );
      setMessage("Solicitud aprobada correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo aprobar la solicitud.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reservationId) => {
    const rejectionReason = (reasons[reservationId] || "").trim();

    if (!rejectionReason) {
      setError("Debes indicar un motivo para denegar la solicitud.");
      setMessage("");
      return;
    }

    try {
      setProcessingId(reservationId);
      setError("");
      setMessage("");
      const updatedReservation = await updateReservationStatus(reservationId, {
        status: "rejected",
        rejectionReason,
      });

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === reservationId ? updatedReservation : reservation
        )
      );
      setMessage("Solicitud denegada correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo denegar la solicitud.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reservationId) => {
    const confirmed = window.confirm(
      "Se eliminara la reserva seleccionada. ¿Quieres continuar?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(reservationId);
      setError("");
      setMessage("");
      await deleteReservation(reservationId);
      setReservations((currentReservations) =>
        currentReservations.filter((reservation) => reservation._id !== reservationId)
      );
      setMessage("Reserva eliminada correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo eliminar la reserva.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <p className="admin-eyebrow">Modulo</p>
        <h2>Solicitudes y reservas</h2>
        <p>
          El admin puede revisar las solicitudes recibidas, aprobarlas o
          denegarlas con un motivo visible para el usuario.
        </p>
      </div>

      {(error || message) && (
        <div className={error ? "admin-feedback admin-error" : "admin-feedback admin-success"}>
          {error || message}
        </div>
      )}

      <section className="admin-list-card">
        <div className="admin-form-header">
          <h3>Solicitudes recibidas</h3>
          <p>
            {loading
              ? "Cargando reservas..."
              : `${reservations.length} solicitudes o reservas disponibles en el panel.`}
          </p>
        </div>

        {loading ? (
          <p>Cargando reservas...</p>
        ) : reservations.length === 0 ? (
          <p>No hay reservas registradas todavia.</p>
        ) : (
          <div className="admin-reservation-list">
            {reservations.map((reservation) => (
              <article key={reservation._id} className="admin-reservation-item">
                <div className="admin-reservation-summary">
                  <div className="admin-reservation-top">
                    <h3>{reservation.apartment?.title || "Apartamento eliminado"}</h3>
                    <div className="user-reservation-badges">
                      <span className="admin-reservation-price">
                        {reservation.totalPrice} EUR
                      </span>
                      <span className={`status-pill status-${reservation.status}`}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </div>
                  </div>

                  <p>
                    <strong>Ciudad:</strong> {reservation.apartment?.city || "No disponible"}
                  </p>
                  <p>
                    <strong>Entrada:</strong> {formatDate(reservation.startDate)}
                  </p>
                  <p>
                    <strong>Salida:</strong> {formatDate(reservation.endDate)}
                  </p>
                  <p>
                    <strong>Creada:</strong> {formatDate(reservation.createdAt)}
                  </p>
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {reservation.user
                      ? `${reservation.user.name} · ${reservation.user.email}`
                      : "Usuario no disponible"}
                  </p>
                  {reservation.status === "rejected" && reservation.rejectionReason && (
                    <div className="page-feedback page-feedback-error">
                      <strong>Motivo de denegacion:</strong> {reservation.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="admin-reservation-controls">
                  {reservation.status === "pending" && (
                    <>
                      <label className="admin-field">
                        <span>Motivo de denegacion</span>
                        <textarea
                          rows="3"
                          value={reasons[reservation._id] || ""}
                          onChange={(event) =>
                            handleReasonChange(reservation._id, event.target.value)
                          }
                          placeholder="Indica por que se rechaza la solicitud"
                        />
                      </label>

                      <div className="admin-apartment-actions">
                        <button
                          type="button"
                          className="admin-primary-button"
                          disabled={processingId === reservation._id}
                          onClick={() => handleApprove(reservation._id)}
                        >
                          {processingId === reservation._id ? "Procesando..." : "Aprobar"}
                        </button>

                        <button
                          type="button"
                          className="admin-danger-button"
                          disabled={processingId === reservation._id}
                          onClick={() => handleReject(reservation._id)}
                        >
                          {processingId === reservation._id ? "Procesando..." : "Denegar"}
                        </button>
                      </div>
                    </>
                  )}

                  {reservation.status !== "pending" && (
                    <div className="page-feedback">
                      Solicitud ya revisada por administracion.
                    </div>
                  )}

                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={deletingId === reservation._id}
                    onClick={() => handleDelete(reservation._id)}
                  >
                    {deletingId === reservation._id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminReservationsPage;
