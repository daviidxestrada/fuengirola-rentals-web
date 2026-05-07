import api from "./api";

export const getApartmentAvailability = async (apartmentId) => {
  const response = await api.get(`/reservations/availability/${apartmentId}`);
  return response.data;
};

export const getMyReservations = async () => {
  const response = await api.get("/reservations/mine");
  return response.data;
};

export const getReservations = async () => {
  const response = await api.get("/reservations");
  return response.data;
};

export const getReservationById = async (id) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

export const createReservation = async (data) => {
  const response = await api.post("/reservations", data);
  return response.data;
};

export const updateReservationStatus = async (id, data) => {
  const response = await api.patch(`/reservations/${id}/status`, data);
  return response.data;
};

export const deleteReservation = async (id) => {
  const response = await api.delete(`/reservations/${id}`);
  return response.data;
};
