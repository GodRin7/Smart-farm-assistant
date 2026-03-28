import API from "./axios";

export const getExpenses = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.crop) params.append("crop", filters.crop);
  if (filters.category) params.append("category", filters.category);

  const query = params.toString();
  const url = query ? `/expenses?${query}` : "/expenses";

  const { data } = await API.get(url);
  return data;
};

export const createExpense = async (formData) => {
  const { data } = await API.post("/expenses", formData);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await API.delete(`/expenses/${id}`);
  return data;
};