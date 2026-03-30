import API from "./axios";

export const getSchedules = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.taskType) params.append("taskType", filters.taskType);
  if (filters.done !== undefined) params.append("done", filters.done);

  const query = params.toString();
  const url = query ? `/schedules?${query}` : "/schedules";
  const { data } = await API.get(url);
  return data;
};

export const createSchedule = async (formData) => {
  const { data } = await API.post("/schedules", formData);
  return data;
};

export const toggleSchedule = async (id) => {
  const { data } = await API.patch(`/schedules/${id}/toggle`);
  return data;
};

export const deleteSchedule = async (id) => {
  const { data } = await API.delete(`/schedules/${id}`);
  return data;
};
