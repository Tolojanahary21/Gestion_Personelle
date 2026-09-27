import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const { access_token: accessToken } = await request
    .json()
    .catch(() => ({} as { access_token?: string }));

  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json({ error: "Jeton manquant." }, { status: 400 });
  }

  try {
    const validation = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!validation.ok) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "Le serveur d'authentification est indisponible." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set("auth_session", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("auth_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
