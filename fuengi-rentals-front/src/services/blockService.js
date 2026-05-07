import api from "./api";

export const getBlocks = async () => {
  const response = await api.get("/blocks");
  return response.data;
};

export const createBlock = async (data) => {
  const response = await api.post("/blocks", data);
  return response.data;
};

export const deleteBlock = async (id) => {
  const response = await api.delete(`/blocks/${id}`);
  return response.data;
};
