import API from "./axios";

export const getHarvests = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.crop) params.append("crop", filters.crop);

  const query = params.toString();
  const url = query ? `/harvests?${query}` : "/harvests";

  const { data } = await API.get(url);
  return data;
};

export const createHarvest = async (formData) => {
  const { data } = await API.post("/harvests", formData);
  return data;
};

export const deleteHarvest = async (id) => {
  const { data } = await API.delete(`/harvests/${id}`);
  return data;
};