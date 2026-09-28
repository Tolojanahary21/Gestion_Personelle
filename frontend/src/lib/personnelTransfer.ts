export type PersonnelImportRow = Record<string, string>;

export function parseCsv(source: string): PersonnelImportRow[] {
  const text = source.replace(/^\uFEFF/, "").trim();
  if (!text) return [];
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = [";", ",", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const matrix: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(value.trim()); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell)) matrix.push(row);
      row = []; value = "";
    } else value += char;
  }
  row.push(value.trim());
  if (row.some((cell) => cell)) matrix.push(row);
  if (matrix.length < 2) return [];
  const headers = matrix[0].map((header) => normalizeHeader(header));
  return matrix.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

export function normalizeHeader(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const quote = (cell: string | number | null | undefined) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((line) => line.map(quote).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

export function printReport(title: string, headers: string[], rows: (string | number | null | undefined)[][], qrDataUrl?: string, target?: Window) {
  const popup = target ?? window.open("", "_blank", "width=1000,height=720");
  if (!popup) throw new Error("Autorisez les fenêtres contextuelles pour générer le PDF.");
  popup.opener = null;
  const escape = (value: string | number | null | undefined) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  popup.document.open();
  popup.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escape(title)}</title><style>body{font:12px Arial,sans-serif;color:#111827;padding:28px}h1{font-size:20px}p{color:#64748b}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9}.verification{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:28px;color:#64748b;font-size:10px}.verification img{width:88px;height:88px}@media print{body{padding:0}}</style></head><body><h1>${escape(title)}</h1><p>Généré le ${escape(new Date().toLocaleString("fr-FR"))}</p><table><thead><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>${qrDataUrl ? `<footer class="verification"><span>QR de référence · ${escape(title)}</span><img src="${escape(qrDataUrl)}" alt="QR de référence" /></footer>` : ""}<script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}
