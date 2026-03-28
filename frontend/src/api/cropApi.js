import API from "./axios";

export const getCrops = async (status = "") => {
  const url = status ? `/crops?status=${status}` : "/crops";
  const { data } = await API.get(url);
  return data;
};

export const getCropById = async (id) => {
  const { data } = await API.get(`/crops/${id}`);
  return data;
};

export const createCrop = async (formData) => {
  const { data } = await API.post("/crops", formData);
  return data;
};

export const updateCrop = async (id, formData) => {
  const { data } = await API.put(`/crops/${id}`, formData);
  return data;
};

export const deleteCrop = async (id) => {
  const { data } = await API.delete(`/crops/${id}`);
  return data;
};