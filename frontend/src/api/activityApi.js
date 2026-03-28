import API from "./axios";

export const getActivities = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.crop) params.append("crop", filters.crop);
  if (filters.activityType) params.append("activityType", filters.activityType);

  const query = params.toString();
  const url = query ? `/activities?${query}` : "/activities";

  const { data } = await API.get(url);
  return data;
};

export const createActivity = async (formData) => {
  const { data } = await API.post("/activities", formData);
  return data;
};

export const deleteActivity = async (id) => {
  const { data } = await API.delete(`/activities/${id}`);
  return data;
};