import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const ACCESS_COOKIE = "auth_session";
const REFRESH_COOKIE = "auth_refresh";
const ROLE_COOKIE = "auth_role";
const ACCESS_TTL_SECONDS = 30 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

type RouteContext = { params: Promise<{ path: string[] }> };
type Tokens = { access_token: string; refresh_token: string };

function jsonError(message: string, status: number) {
  return NextResponse.json({ detail: message }, { status });
}

function backendUrl(path: string[], request: NextRequest) {
  const endpoint = path.map((part) => encodeURIComponent(part)).join("/");
  return `${API_URL}/${endpoint}${request.nextUrl.search}`;
}

async function requestBackend(url: string, method: string, token?: string, body?: BodyInit | null) {
  return fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    cache: "no-store",
  });
}

function saveTokens(response: NextResponse, tokens: Tokens) {
  response.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...cookieOptions,
    maxAge: ACCESS_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...cookieOptions,
    maxAge: REFRESH_TTL_SECONDS,
  });
}

function clearTokens(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(ROLE_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

type AuthUser = { id_user: number; username: string; role: string; personnel_id: number | null };
function saveUserRole(response: NextResponse, user: AuthUser) {
  response.cookies.set(ROLE_COOKIE, user.role, { ...cookieOptions, maxAge: REFRESH_TTL_SECONDS });
}

async function getValidAccessToken(
  accessToken: string | undefined,
  refreshToken: string | undefined,
): Promise<{ accessToken: string; refreshed?: Tokens; user: AuthUser } | null> {
  if (accessToken) {
    const validation = await requestBackend(`${API_URL}/auth/me`, "GET", accessToken);
    if (validation.ok) return { accessToken, user: await validation.json() as AuthUser };
  }

  if (!refreshToken) return null;

  const refreshResponse = await requestBackend(
    `${API_URL}/auth/refresh`,
    "POST",
    undefined,
    JSON.stringify({ refresh_token: refreshToken }),
  );
  if (!refreshResponse.ok) return null;

  const refreshed = (await refreshResponse.json()) as Tokens;
  const validation = await requestBackend(`${API_URL}/auth/me`, "GET", refreshed.access_token);
  if (!validation.ok) return null;
  return { accessToken: refreshed.access_token, refreshed, user: await validation.json() as AuthUser };
}

const normalizeIdentity = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();

async function registerStaff(request: NextRequest) {
  if (request.method !== "POST") return jsonError("Méthode non autorisée.", 405);
  let input: { username?: string; password?: string; confirmation?: string; first_names?: string; last_name?: string; matricule?: string; email?: string };
  try { input = await request.json(); } catch { return jsonError("Formulaire d’inscription invalide.", 400); }
  const username = input.username?.trim();
  const firstNames = input.first_names?.trim();
  const lastName = input.last_name?.trim();
  const matricule = input.matricule?.trim();
  const email = input.email?.trim();
  if (!username || username.length < 3 || username.length > 100 || !input.password || input.password.length < 8 || input.password.length > 255 || input.password !== input.confirmation || !firstNames || firstNames.length > 150 || !lastName || lastName.length > 100 || !matricule || matricule.length > 100 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Vérifiez les champs requis, l’e-mail, le nom d’utilisateur (3 caractères minimum) et le mot de passe (8 caractères minimum).", 422);
  }
  const [personnelResponse, militaryResponse, userResponse] = await Promise.all([
    fetch(`${API_URL}/personnel/`, { cache: "no-store" }),
    fetch(`${API_URL}/military-info/`, { cache: "no-store" }),
    fetch(`${API_URL}/users/`, { cache: "no-store" }),
  ]);
  if (![personnelResponse, militaryResponse, userResponse].every((response) => response.ok)) return jsonError("Vérification du dossier impossible. Réessayez plus tard.", 503);
  const [personnel, military, users] = await Promise.all([personnelResponse.json(), militaryResponse.json(), userResponse.json()]) as [Array<{ id_personnel: number; last_name: string; first_names: string; email: string | null }>, Array<{ personnel_id: number; matricule: string }>, Array<{ username: string; personnel_id: number | null }>];
  const militaryRecord = military.find((item) => normalizeIdentity(item.matricule) === normalizeIdentity(matricule));
  const employee = militaryRecord && personnel.find((item) => item.id_personnel === militaryRecord.personnel_id && normalizeIdentity(item.last_name) === normalizeIdentity(lastName) && normalizeIdentity(item.first_names) === normalizeIdentity(firstNames) && item.email && normalizeIdentity(item.email) === normalizeIdentity(email));
  if (!employee) return jsonError("Aucun dossier personnel ne correspond à ces nom, prénoms et matricule.", 404);
  if (users.some((user) => normalizeIdentity(user.username) === normalizeIdentity(username))) return jsonError("Ce nom d’utilisateur est déjà utilisé.", 409);
  if (users.some((user) => user.personnel_id === employee.id_personnel)) return jsonError("Un compte est déjà associé à ce dossier personnel. Contactez l’administration.", 409);
  const created = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: input.password, role: "Staff", personnel_id: employee.id_personnel }),
    cache: "no-store",
  });
  if (!created.ok) return new NextResponse(await created.text(), { status: created.status, headers: { "Content-Type": "application/json" } });
  return NextResponse.json({ message: "Compte créé. Vous pouvez maintenant vous connecter." }, { status: 201 });
}

function staffCanRead(path: string[], method: string, personnelId: number | null) {
  if (method !== "GET" || personnelId === null) return false;
  if (path.length === 2 && path[0] === "auth" && path[1] === "me") return true;
  const scopedResources = ["children", "languages", "computer-skills", "decorations", "attachments", "assignments", "trainings"];
  if (path.length === 3 && scopedResources.includes(path[0]) && path[1] === "personnel") return Number(path[2]) === personnelId;
  if (path.length === 2 && path[0] === "personnel") return Number(path[1]) === personnelId;
  if (path.length === 3 && path[0] === "military-info" && path[1] === "personnel") return Number(path[2]) === personnelId;
  return false;
}

async function handleRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const method = request.method;
  const origin = request.headers.get("origin");
  if (method !== "GET" && method !== "HEAD" && origin && origin !== request.nextUrl.origin) {
    return jsonError("Origine de requête non autorisée.", 403);
  }
  const url = backendUrl(path, request);
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const isLogin = path.length === 2 && path[0] === "auth" && path[1] === "login";
  const isRegister = path.length === 2 && path[0] === "auth" && path[1] === "register";
  const isLogout = path.length === 2 && path[0] === "auth" && path[1] === "logout";

  if (isRegister) return registerStaff(request);

  if (isLogin) {
    if (method !== "POST") return jsonError("Méthode non autorisée.", 405);

    let body: string;
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return jsonError("Requête de connexion invalide.", 400);
    }

    const loginResponse = await requestBackend(url, "POST", undefined, body);
    if (!loginResponse.ok) {
      return new NextResponse(await loginResponse.text(), {
        status: loginResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tokens = (await loginResponse.json()) as Tokens;
    const profileResponse = await requestBackend(`${API_URL}/auth/me`, "GET", tokens.access_token);
    if (!profileResponse.ok) return jsonError("La session n'a pas pu être validée.", 401);

    const user = await profileResponse.json() as AuthUser;
    const role = user.role?.toUpperCase();
    if (role !== "ADMIN" && !(role === "STAFF" && user.personnel_id !== null)) {
      return jsonError("Ce compte n'est pas autorisé à accéder à cette application.", 403);
    }

    const response = NextResponse.json(user);
    saveTokens(response, tokens);
    saveUserRole(response, user);
    return response;
  }

  if (isLogout) {
    let response = NextResponse.json({ message: "Session fermée." });
    try {
      const session = await getValidAccessToken(accessToken, refreshToken);
      if (session) {
        const upstream = await requestBackend(
          url,
          "POST",
          session.accessToken,
          JSON.stringify({ refresh_token: session.refreshed?.refresh_token ?? refreshToken }),
        );
        if (!upstream.ok) {
          response = new NextResponse(await upstream.text(), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    } catch (error) {
      console.error("Backend logout request failed:", error);
    }
    clearTokens(response);
    return response;
  }

  const session = await getValidAccessToken(accessToken, refreshToken);

  if (!session) {
    const response = jsonError("Session absente ou expirée. Reconnectez-vous.", 401);
    clearTokens(response);
    return response;
  }

  if (session.user.role.toUpperCase() === "STAFF" && !staffCanRead(path, method, session.user.personnel_id)) {
    return jsonError("Accès limité à votre espace personnel.", 403);
  }

  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = await requestBackend(url, method, session.accessToken, body);
  const response = upstream.status === 204
    ? new NextResponse(null, { status: 204 })
    : new NextResponse(await upstream.text(), {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        },
      });

  if (session.refreshed) saveTokens(response, session.refreshed);
  saveUserRole(response, session.user);
  return response;
}

async function handle(request: NextRequest, context: RouteContext) {
  try {
    return await handleRequest(request, context);
  } catch (error) {
    console.error("Backend proxy request failed:", error);
    return jsonError("Le serveur backend est indisponible.", 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
