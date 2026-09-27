import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addRefreshedSession, getServerSession } from "../../../lib/serverAuth";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function error(message: string, status: number) { return NextResponse.json({ detail: message }, { status }); }
function matchesSignature(extension: string, bytes: Uint8Array) {
  if (extension === "pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (extension === "png") return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (["jpg", "jpeg"].includes(extension)) return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (["docx", "xlsx"].includes(extension)) return bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (extension === "txt") return !bytes.includes(0);
  return false;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return error("Session absente ou expirée.", 401);
  if (session.user.role.toUpperCase() !== "ADMIN") return error("Seuls les administrateurs peuvent ajouter des pièces jointes.", 403);
  const formData = await request.formData();
  const entry = formData.get("file");
  if (!(entry instanceof File)) return error("Sélectionnez un fichier.", 400);
  if (entry.size < 1 || entry.size > MAX_FILE_SIZE) return error("Le fichier doit peser moins de 10 Mo.", 413);
  const originalName = entry.name.split(/[\\/]/).pop() ?? "document";
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "";
  const expectedMime = MIME_BY_EXTENSION[extension];
  if (!expectedMime || (entry.type && entry.type !== expectedMime)) return error("Format non accepté. Utilisez PDF, PNG, JPEG, TXT, DOCX ou XLSX.", 415);
  const bytes = new Uint8Array(await entry.arrayBuffer());
  if (!matchesSignature(extension, bytes)) return error("Le contenu du fichier ne correspond pas à son extension.", 415);
  const storageDirectory = join(process.cwd(), "public", "upload");
  const storedName = `${randomUUID()}.${extension}`;
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(join(storageDirectory, storedName), bytes, { flag: "wx" });
  const response = NextResponse.json({ file_name: originalName, file_path: `/upload/${storedName}`, file_type: expectedMime, file_size: entry.size }, { status: 201 });
  return addRefreshedSession(response, session);
}
