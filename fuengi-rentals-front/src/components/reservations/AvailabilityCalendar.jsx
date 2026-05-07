import { useMemo, useState } from "react";

const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseRangeDate = (value) => {
  const date = new Date(value);
  return startOfDay(date);
};

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthDays = (visibleMonth) => {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const lastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: leadingEmptyDays }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
  }

  return days;
};

const getSourceLabel = (range) => {
  if (range.source === "booking_calendar") {
    return "Booking";
  }

  if (range.source === "block") {
    return "Bloqueo";
  }

  return "Reserva";
};

function AvailabilityCalendar({ unavailableRanges }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const normalizedRanges = useMemo(
    () =>
      unavailableRanges.map((range) => ({
        ...range,
        startDate: parseRangeDate(range.startDate),
        endDate: parseRangeDate(range.endDate),
      })),
    [unavailableRanges]
  );

  const days = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);

  const getRangeForDay = (day) =>
    normalizedRanges.find((range) => day >= range.startDate && day < range.endDate);

  return (
    <div className="availability-calendar">
      <div className="availability-calendar-header">
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
          aria-label="Mes anterior"
        >
          {"<"}
        </button>
        <h3>{monthFormatter.format(visibleMonth)}</h3>
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
          aria-label="Mes siguiente"
        >
          {">"}
        </button>
      </div>

      <div className="availability-calendar-grid availability-calendar-weekdays">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="availability-calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="availability-calendar-empty" />;
          }

          const matchingRange = getRangeForDay(day);

          return (
            <span
              key={day.toISOString()}
              className={
                matchingRange
                  ? "availability-calendar-day availability-calendar-day-busy"
                  : "availability-calendar-day"
              }
              title={matchingRange ? getSourceLabel(matchingRange) : "Disponible"}
            >
              {day.getDate()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
