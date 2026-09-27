import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/acces-refuse"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has("auth_session")) {
    return NextResponse.redirect(new URL("/acces-refuse", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth/session|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
