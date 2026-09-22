import api from "./api";

export async function getPersonnels() {
  const response = await api.get("/personnel/");
  return response.data;
}