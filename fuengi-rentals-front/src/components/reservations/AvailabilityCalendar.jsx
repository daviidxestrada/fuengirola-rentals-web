import { useMemo, useState } from "react";

import { toIsoDate, todayIso } from "../../utils";

const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthCells = (visibleMonth) => {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const lastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: leadingEmptyDays }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    cells.push(toIsoDate(date));
  }

  while (cells.length % 7) {
    cells.push(null);
  }

  return cells;
};

const getRangeKind = (range) => {
  if (range.source === "booking_calendar") {
    return "booking";
  }

  if (range.source === "block") {
    return "block";
  }

  return "web";
};

function AvailabilityCalendar({ unavailableRanges = [], range = {}, onDateSelect }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const today = todayIso();

  const normalizedRanges = useMemo(
    () =>
      unavailableRanges.map((item) => ({
        ...item,
        startDate: toIsoDate(item.startDate),
        endDate: toIsoDate(item.endDate),
        kind: getRangeKind(item),
      })),
    [unavailableRanges]
  );

  const cells = useMemo(() => getMonthCells(visibleMonth), [visibleMonth]);

  const getDayInfo = (iso) => {
    if (iso < today) {
      return { kind: "past", disabled: true, title: "Fecha pasada" };
    }

    const occupiedRange = normalizedRanges.find(
      (item) => iso >= item.startDate && iso < item.endDate
    );

    if (occupiedRange) {
      return {
        kind: occupiedRange.kind,
        disabled: true,
        title: occupiedRange.sourceName || "Ocupado",
      };
    }

    return { kind: "free", disabled: false, title: "Disponible" };
  };

  return (
    <div className="calendar">
      <div className="cal-nav">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
          aria-label="Mes anterior"
        >
          {"<"}
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
          aria-label="Mes siguiente"
        >
          {">"}
        </button>
      </div>

      <div className="cal-months">
        <div className="cal-month">
          <div className="cal-month-title">{monthFormatter.format(visibleMonth)}</div>
          <div className="cal-weekdays">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((iso, index) => {
              if (!iso) {
                return <span key={`empty-${index}`} className="cal-cell empty" />;
              }

              const dayInfo = getDayInfo(iso);
              const isStart = range.startDate === iso;
              const isEnd = range.endDate === iso;
              const inRange = range.startDate && range.endDate && iso > range.startDate && iso < range.endDate;
              const isToday = iso === today;
              const className = [
                "cal-cell",
                `kind-${dayInfo.kind}`,
                isStart ? "range-start" : "",
                isEnd ? "range-end" : "",
                inRange ? "in-range" : "",
                isToday ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  type="button"
                  key={iso}
                  className={className}
                  disabled={dayInfo.disabled}
                  title={dayInfo.title}
                  onClick={() => onDateSelect?.(iso)}
                >
                  <span className="cal-num">{Number(iso.slice(8, 10))}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
