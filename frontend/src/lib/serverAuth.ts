import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
type Tokens = { access_token: string; refresh_token: string };
export type ServerUser = { id_user: number; username: string; role: string; personnel_id: number | null };
export type ServerSession = { user: ServerUser; accessToken: string; refreshed?: Tokens };

export async function getServerSession(): Promise<ServerSession | null> {
  const jar = await cookies();
  const accessToken = jar.get("auth_session")?.value;
  const refreshToken = jar.get("auth_refresh")?.value;
  if (accessToken) {
    const response = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (response.ok) return { user: await response.json() as ServerUser, accessToken };
  }
  if (!refreshToken) return null;
  const refreshedResponse = await fetch(`${API_URL}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }), cache: "no-store" });
  if (!refreshedResponse.ok) return null;
  const refreshed = await refreshedResponse.json() as Tokens;
  const profile = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${refreshed.access_token}` }, cache: "no-store" });
  if (!profile.ok) return null;
  return { user: await profile.json() as ServerUser, accessToken: refreshed.access_token, refreshed };
}

export function addRefreshedSession(response: NextResponse, session: ServerSession) {
  if (!session.refreshed) return response;
  response.cookies.set("auth_session", session.refreshed.access_token, { ...cookieOptions, maxAge: 30 * 60 });
  response.cookies.set("auth_refresh", session.refreshed.refresh_token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
  return response;
}
