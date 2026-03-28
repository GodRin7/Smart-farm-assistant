import API from "./axios";

export const getDashboard = async () => {
  const { data } = await API.get("/dashboard");
  return data;
};