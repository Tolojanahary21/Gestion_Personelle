import api from "../../lib/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id_user: number;
  username: string;
  role: string;
  personnel_id: number | null;
}

export async function login(
  credentials: LoginRequest
): Promise<UserResponse> {
  const response = await api.post<UserResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>("/auth/me");

  return response.data;
}
