import { api } from "./api";
import type { AuthUser } from "../store/auth-store";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      username,
      password,
    }
  );

  return response.data;
}

export async function getCurrentUser(
  accessToken: string
): Promise<AuthUser> {
  const response = await api.get<AuthUser>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}