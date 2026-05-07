import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context";
import { createReservation, getApartmentAvailability } from "../../services";
import { daysBetween, formatDateLong, todayIso, toIsoDate } from "../../utils";
import AvailabilityCalendar from "./AvailabilityCalendar";

const sourceLabels = {
  booking_calendar: "Booking.com",
  block: "Bloqueo manual",
  reservation: "Reserva web",
};

function ReservationForm({ apartment }) {
  const { user, authReady } = useContext(AuthContext);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const apartmentId = apartment?._id;

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        const data = await getApartmentAvailability(apartmentId);
        setUnavailableRanges(data.unavailableRanges || []);
      } catch (requestError) {
        console.error(requestError);
        setError("No se pudo cargar la disponibilidad.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (apartmentId) {
      fetchAvailability();
    }
  }, [apartmentId]);

  const normalizedRanges = useMemo(
    () =>
      unavailableRanges.map((item) => ({
        ...item,
        startDate: toIsoDate(item.startDate),
        endDate: toIsoDate(item.endDate),
      })),
    [unavailableRanges]
  );

  const upcomingRanges = useMemo(
    () =>
      normalizedRanges
        .filter((item) => item.endDate >= todayIso())
        .sort((firstItem, secondItem) => firstItem.startDate.localeCompare(secondItem.startDate))
        .slice(0, 6),
    [normalizedRanges]
  );

  const hasOverlap = (nextStartDate, nextEndDate) =>
    normalizedRanges.some(
      (item) => nextStartDate < item.endDate && nextEndDate > item.startDate
    );

  const handleDateSelect = (iso) => {
    setError("");
    setMessage("");

    if (!range.startDate || range.endDate || iso <= range.startDate) {
      setRange({ startDate: iso, endDate: "" });
      return;
    }

    if (hasOverlap(range.startDate, iso)) {
      setError("Ese rango pisa una fecha ocupada. Elige otra salida.");
      setRange({ startDate: iso, endDate: "" });
      return;
    }

    setRange((currentRange) => ({
      ...currentRange,
      endDate: iso,
    }));
  };

  const nights = range.startDate && range.endDate ? daysBetween(range.startDate, range.endDate) : 0;
  const total = nights * Number(apartment?.price || 0);

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!range.startDate || !range.endDate) {
      setError("Selecciona fecha de entrada y salida en el calendario.");
      return;
    }

    if (range.startDate < todayIso()) {
      setError("No puedes seleccionar fechas pasadas.");
      return;
    }

    if (range.endDate <= range.startDate) {
      setError("La fecha de salida debe ser posterior a la entrada.");
      return;
    }

    if (hasOverlap(range.startDate, range.endDate)) {
      setError("Las fechas seleccionadas no estan disponibles.");
      return;
    }

    try {
      setLoading(true);
      await createReservation({
        apartment: apartmentId,
        startDate: range.startDate,
        endDate: range.endDate,
      });
      setMessage("Solicitud enviada. Queda pendiente de aprobacion por el admin.");
      setRange({ startDate: "", endDate: "" });

      const data = await getApartmentAvailability(apartmentId);
      setUnavailableRanges(data.unavailableRanges || []);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "Error al crear la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside>
      <div className="book-card">
        <div className="book-price">
          {apartment?.price} EUR <small>/ noche</small>
        </div>
        <p className="book-helper">
          Selecciona entrada y salida. Las reservas de Booking y los bloqueos no se pueden elegir.
        </p>

        <div className="date-fields">
          <div className="date-field">
            <div className="date-field-label">Entrada</div>
            <div className={`date-field-value${range.startDate ? "" : " empty"}`}>
              {range.startDate ? formatDateLong(range.startDate) : "-"}
            </div>
          </div>
          <div className="date-field">
            <div className="date-field-label">Salida</div>
            <div className={`date-field-value${range.endDate ? "" : " empty"}`}>
              {range.endDate ? formatDateLong(range.endDate) : "-"}
            </div>
          </div>
        </div>

        {error ? <div className="book-error">{error}</div> : null}
        {message ? (
          <div className="book-success">
            <strong>Solicitud recibida</strong>
            <div>{message}</div>
          </div>
        ) : null}

        {nights > 0 ? (
          <>
            <div className="book-summary">
              <span>
                {apartment?.price} EUR x {nights} {nights === 1 ? "noche" : "noches"}
              </span>
              <span>{total} EUR</span>
            </div>
            <div className="book-summary book-total">
              <span>Total estimado</span>
              <span>{total} EUR</span>
            </div>
          </>
        ) : null}

        {!authReady ? (
          <div className="book-helper">Comprobando sesion...</div>
        ) : !user ? (
          <div className="book-auth">
            <Link to="/login" className="btn btn-accent btn-block btn-lg">
              Login para reservar
            </Link>
            <p>
              No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </p>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-accent btn-block btn-lg"
            onClick={handleSubmit}
            disabled={loading || !range.startDate || !range.endDate}
          >
            {loading ? "Enviando solicitud..." : "Solicitar reserva"}
          </button>
        )}
      </div>

      <div className="detail-section availability-section">
        <h3>Disponibilidad</h3>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot free" />Disponible</span>
          <span className="legend-item"><span className="legend-dot web" />Reserva web</span>
          <span className="legend-item"><span className="legend-dot block" />Bloqueo</span>
          <span className="legend-item"><span className="legend-dot booking" />Booking</span>
        </div>

        {availabilityLoading ? (
          <p className="book-helper">Cargando calendario...</p>
        ) : (
          <AvailabilityCalendar
            unavailableRanges={normalizedRanges}
            range={range}
            onDateSelect={handleDateSelect}
          />
        )}

        {upcomingRanges.length > 0 ? (
          <div className="occ-list">
            {upcomingRanges.map((item) => (
              <div className="occ-list-item" key={`${item.source}-${item._id}-${item.startDate}`}>
                <span
                  className={`legend-dot ${
                    item.source === "booking_calendar"
                      ? "booking"
                      : item.source === "block"
                        ? "block"
                        : "web"
                  }`}
                />
                <span>
                  {formatDateLong(item.startDate)} - {formatDateLong(item.endDate)}
                  {" - "}
                  {sourceLabels[item.source] || item.sourceName || "Ocupado"}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export default ReservationForm;
