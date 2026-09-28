import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { addRefreshedSession, getServerSession } from "../../../../lib/serverAuth";

export const runtime = "nodejs";
type Context = { params: Promise<{ filename: string }> };
function validName(filename: string) { return /^[a-f0-9-]{36}\.(pdf|png|jpg|jpeg|txt|docx|xlsx)$/i.test(filename); }
function mime(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : ["jpg", "jpeg"].includes(extension ?? "") ? "image/jpeg" : extension === "txt" ? "text/plain; charset=utf-8" : extension === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

export async function GET(request: NextRequest, context: Context) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ detail: "Session absente ou expirée." }, { status: 401 });
  if (session.user.role.toUpperCase() !== "ADMIN") return NextResponse.json({ detail: "Accès refusé." }, { status: 403 });
  const { filename } = await context.params;
  if (!validName(filename)) return NextResponse.json({ detail: "Fichier introuvable." }, { status: 404 });
  try {
    const bytes = await readFile(join(process.cwd(), "public", "upload", filename));
    const suppliedName = request.nextUrl.searchParams.get("name") ?? filename;
    const safeName = suppliedName.replace(/[\r\n"\\/]/g, "_").slice(0, 180);
    const response = new NextResponse(bytes, { headers: { "Content-Type": mime(filename), "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
    return addRefreshedSession(response, session);
  } catch { return NextResponse.json({ detail: "Fichier introuvable." }, { status: 404 }); }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ detail: "Session absente ou expirée." }, { status: 401 });
  if (session.user.role.toUpperCase() !== "ADMIN") return NextResponse.json({ detail: "Accès refusé." }, { status: 403 });
  const { filename } = await context.params;
  if (!validName(filename)) return NextResponse.json({ detail: "Fichier introuvable." }, { status: 404 });
  try {
    await unlink(join(process.cwd(), "public", "upload", filename));
    return addRefreshedSession(NextResponse.json({ message: "Fichier supprimé." }), session);
  } catch { return NextResponse.json({ detail: "Fichier introuvable." }, { status: 404 }); }
}
