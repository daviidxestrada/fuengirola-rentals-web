export const todayIso = () => new Date().toISOString().slice(0, 10);

export const toIsoDate = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
};

export const addDays = (isoDate, amount) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
};

export const daysBetween = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.max(0, Math.round((end - start) / millisecondsPerDay));
};

export const formatDate = (value, options = {}) =>
  new Date(`${toIsoDate(value)}T00:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });

export const formatDateShort = (value) =>
  new Date(`${toIsoDate(value)}T00:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const formatDateLong = (value) =>
  new Date(`${toIsoDate(value)}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
