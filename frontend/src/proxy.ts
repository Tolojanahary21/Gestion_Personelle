import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/acces-refuse"];
const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/upload/")) {
    const accessToken = request.cookies.get("auth_session")?.value;
    if (!accessToken) return new NextResponse(null, { status: 404 });
    try {
      const profile = await fetch(`${BACKEND_API_URL}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
      if (!profile.ok) return new NextResponse(null, { status: 404 });
      const user = await profile.json() as { role?: string };
      if (user.role?.toUpperCase() !== "ADMIN") return new NextResponse(null, { status: 404 });
    } catch { return new NextResponse(null, { status: 404 }); }
    return NextResponse.next();
  }

  if (pathname === "/api/backend/auth/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/backend/")) {
    return NextResponse.next();
  }

  if (pathname === "/" || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has("auth_session") && !request.cookies.has("auth_refresh")) {
    return NextResponse.redirect(new URL("/acces-refuse", request.url));
  }

  if (request.cookies.get("auth_role")?.value?.toUpperCase() === "STAFF" && pathname !== "/mon-espace") {
    return NextResponse.redirect(new URL("/mon-espace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth/session|_next/static|_next/image|favicon.ico|.*\\..*).*)", "/upload/:path*"],
};
