import api from "../../lib/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id_user: number;
  username: string;
  role: string;
  personnel_id: number | null;
}

export async function login(
  credentials: LoginRequest
): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
}

export async function getCurrentUser(
  accessToken: string
): Promise<UserResponse> {
  const response = await api.get<UserResponse>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}