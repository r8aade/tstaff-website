import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { parseBody } from "@/lib/agreementText";

// Builds the signed copy of an agreement: Talnt logo, the exact text signed, and a
// signature block with the drawn signature and the signing record.

const ORANGE = rgb(0xc1 / 255, 0x5b / 255, 0x2b / 255);
const PURPLE = rgb(0x43 / 255, 0x38 / 255, 0xca / 255);
const INK = rgb(0.1, 0.1, 0.12);
const GREY = rgb(0.4, 0.4, 0.45);

// Same shapes as src/components/LogoMark.tsx (100x100 viewBox).
const LOGO_LEFT = "M50,8 L18,27 L18,63 L50,82 L50,58 L30,46.5 L50,35 Z";
const LOGO_RIGHT = "M50,8 L82,27 L82,63 L50,82 L50,58 L70,46.5 L50,35 Z";

/** Standard PDF fonts only cover Latin-1-ish characters; swap the rest so drawing never throws. */
function safe(text: string, font: PDFFont): string {
  const map: Record<string, string> = { "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "…": "..." };
  let out = "";
  for (const ch of text.replace(/[‘’“”–—…]/g, (c) => map[c])) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildSignedPdf(opts: {
  title: string;
  body: string;
  version: number;
  signerName: string;
  email: string;
  signatureDataUrl: string;
  signedAtText: string;
  ip: string | null;
  signatureId: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${opts.title} - ${opts.signerName}`);
  pdf.setAuthor("Talnt Staffing");
  pdf.setCreator("talntstaffing.com");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 612;
  const H = 792;
  const M = 60;
  const width = W - M * 2;
  let page: PDFPage;
  let y = 0;

  const header = (p: PDFPage) => {
    const s = 0.3; // logo 30pt square
    p.drawSvgPath(LOGO_LEFT, { x: M, y: H - 40, scale: s, color: ORANGE });
    p.drawSvgPath(LOGO_RIGHT, { x: M, y: H - 40, scale: s, color: PURPLE });
    p.drawText("Talnt", { x: M + 36, y: H - 62, size: 16, font: bold, color: INK });
    p.drawText("Staffing", { x: M + 36 + bold.widthOfTextAtSize("Talnt", 16) + 3, y: H - 62, size: 16, font, color: ORANGE });
    p.drawText("talntstaffing.com", { x: W - M - font.widthOfTextAtSize("talntstaffing.com", 9), y: H - 60, size: 9, font, color: GREY });
    p.drawLine({ start: { x: M, y: H - 78 }, end: { x: W - M, y: H - 78 }, thickness: 0.75, color: rgb(0.85, 0.85, 0.87) });
  };
  const newPage = () => {
    page = pdf.addPage([W, H]);
    header(page);
    y = H - 105;
  };
  const need = (h: number) => {
    if (y - h < M + 20) newPage();
  };
  const text = (t: string, size: number, f: PDFFont, color = INK, indent = 0, gap = 4) => {
    for (const line of wrap(safe(t, f), f, size, width - indent)) {
      need(size + gap);
      page.drawText(line, { x: M + indent, y: y - size, size, font: f, color });
      y -= size + gap;
    }
  };

  newPage();
  text(opts.title, 18, bold);
  y -= 6;

  for (const b of parseBody(opts.body)) {
    if (b.kind === "h") {
      y -= 8;
      need(30);
      text(b.text, 11.5, bold);
      y -= 2;
    } else if (b.kind === "p") {
      text(b.text, 10, font, INK, 0, 4.5);
      y -= 6;
    } else {
      for (const item of b.items) {
        need(15);
        page!.drawText("•", { x: M + 6, y: y - 10, size: 10, font, color: INK });
        text(item, 10, font, INK, 18, 4.5);
      }
      y -= 6;
    }
  }

  // Signature block
  y -= 14;
  need(190);
  if (y < H - 120) {
    // Divider only when the block follows text on the same page (a new page already has the header line).
    page!.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.75, color: rgb(0.85, 0.85, 0.87) });
    y -= 22;
  }
  text("Signed electronically", 12, bold);
  y -= 4;

  const png = await pdf.embedPng(opts.signatureDataUrl);
  const scale = Math.min(220 / png.width, 70 / png.height, 1);
  const sw = png.width * scale;
  const sh = png.height * scale;
  page!.drawImage(png, { x: M, y: y - sh, width: sw, height: sh });
  y -= sh + 4;
  page!.drawLine({ start: { x: M, y }, end: { x: M + 240, y }, thickness: 0.75, color: INK });
  y -= 14;
  text(opts.signerName, 11, bold);
  y -= 4;

  const rows: [string, string][] = [
    ["Email", opts.email],
    ["Signed", opts.signedAtText],
    ["IP address", opts.ip ?? "not recorded"],
    ["Document", `${opts.title}, version ${opts.version}`],
    ["Signature ID", opts.signatureId]
  ];
  for (const [k, v] of rows) {
    need(14);
    page!.drawText(safe(k, bold), { x: M, y: y - 9, size: 9, font: bold, color: GREY });
    page!.drawText(safe(v, font), { x: M + 80, y: y - 9, size: 9, font, color: INK });
    y -= 14;
  }
  y -= 6;
  text("For Talnt Staffing: accepted by Talnt Staffing on the date above.", 9, font, GREY);

  const pages = pdf.getPages();
  pages.forEach((p, i) =>
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: W - M - 60, y: 30, size: 8, font, color: GREY })
  );
  return pdf.save();
}
