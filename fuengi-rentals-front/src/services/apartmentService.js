import api from "./api";

export const getApartments = async () => {
    const response = await api.get("/apartments");
    return response.data;
};

export const getAdminApartments = async () => {
  const response = await api.get("/apartments/admin/list");
  return response.data;
};

export const getApartmentById = async (id) => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
};

export const createApartment = async (data) => {
    const response = await api.post("/apartments", data);
    return response.data;
};

export const updateApartment = async (id, data) => {
  const response = await api.put(`/apartments/${id}`, data);
  return response.data;
};

export const deleteApartment = async (id) => {
  const response = await api.delete(`/apartments/${id}`);
  return response.data;
};

export const updateBookingCalendarSettings = async (id, data) => {
  const response = await api.patch(`/apartments/${id}/booking-calendar`, data);
  return response.data;
};

export const syncBookingCalendar = async (id) => {
  const response = await api.post(`/apartments/${id}/booking-calendar/sync`);
  return response.data;
};
