import { useEffect, useState } from "react";

import { Field, StateMsg, StatusBadge } from "../../components";
import { deleteReservation, getReservations, updateReservationStatus } from "../../services";
import { formatDateShort, getApartmentImages } from "../../utils";

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
      setReservations(
        [...data].sort(
          (firstReservation, secondReservation) =>
            new Date(secondReservation.createdAt) - new Date(firstReservation.createdAt)
        )
      );
    } catch (requestError) {
      console.error(requestError);
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
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo aprobar la solicitud.");
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
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo denegar la solicitud.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reservationId) => {
    const confirmed = window.confirm("Se eliminara la reserva seleccionada. Quieres continuar?");

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
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo eliminar la reserva.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Solicitudes y reservas</h1>
          <p>Aprueba solicitudes web o deniegalas con un motivo visible para el usuario.</p>
        </div>
      </div>

      {(error || message) ? (
        <div className={error ? "admin-feedback admin-error" : "admin-feedback admin-success"}>
          {error || message}
        </div>
      ) : null}

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>Solicitudes recibidas</h2>
            <p>{loading ? "Cargando reservas..." : `${reservations.length} reservas en el panel.`}</p>
          </div>
        </div>

        {loading ? (
          <StateMsg kind="loading" title="Cargando reservas" />
        ) : reservations.length === 0 ? (
          <StateMsg kind="empty" title="No hay reservas registradas todavia" />
        ) : (
          <div className="admin-reservation-list">
            {reservations.map((reservation) => {
              const image = getApartmentImages(reservation.apartment)[0];

              return (
                <article key={reservation._id} className="admin-reservation-item">
                  <div className="admin-reservation-media" style={{ backgroundImage: `url(${image})` }} />

                  <div className="admin-reservation-summary">
                    <div className="admin-reservation-top">
                      <div>
                        <h3>{reservation.apartment?.title || "Apartamento eliminado"}</h3>
                        <p>{reservation.apartment?.city || "No disponible"}</p>
                      </div>
                      <StatusBadge status={reservation.status} />
                    </div>

                    <div className="reservation-meta-grid">
                      <span>Entrada: {formatDateShort(reservation.startDate)}</span>
                      <span>Salida: {formatDateShort(reservation.endDate)}</span>
                      <span>Total: {reservation.totalPrice} EUR</span>
                      <span>
                        Solicitante:{" "}
                        {reservation.user
                          ? `${reservation.user.name} - ${reservation.user.email}`
                          : "Usuario no disponible"}
                      </span>
                    </div>

                    {reservation.status === "rejected" && reservation.rejectionReason ? (
                      <div className="book-error">Motivo: {reservation.rejectionReason}</div>
                    ) : null}
                  </div>

                  <div className="admin-reservation-controls">
                    {reservation.status === "pending" ? (
                      <>
                        <Field
                          label="Motivo de denegacion"
                          as="textarea"
                          rows={3}
                          value={reasons[reservation._id] || ""}
                          onChange={(event) => handleReasonChange(reservation._id, event.target.value)}
                          placeholder="Indica por que se rechaza la solicitud"
                        />
                        <div className="admin-apartment-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={processingId === reservation._id}
                            onClick={() => handleApprove(reservation._id)}
                          >
                            {processingId === reservation._id ? "Procesando..." : "Aprobar"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={processingId === reservation._id}
                            onClick={() => handleReject(reservation._id)}
                          >
                            {processingId === reservation._id ? "Procesando..." : "Denegar"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="book-helper">Solicitud ya revisada por administracion.</div>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={deletingId === reservation._id}
                      onClick={() => handleDelete(reservation._id)}
                    >
                      {deletingId === reservation._id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default AdminReservationsPage;
