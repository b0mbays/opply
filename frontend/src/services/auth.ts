import api from "./api";

export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username, password });
  const response = await api.post<{ token: string }>("/api/auth/login/", body);
  return response.data.token;
}
