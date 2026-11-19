import { prisma } from "@/lib/prisma";

// Default onboarding steps for every new employee. Admins can add more per person.
export const DEFAULT_ONBOARDING: { label: string; needsDocument: boolean }[] = [
  { label: "Contractor agreement signed", needsDocument: true },
  { label: "NDA signed", needsDocument: true },
  { label: "Government ID received", needsDocument: true },
  { label: "Payment method set up (kept outside this app)", needsDocument: false },
  { label: "Computer, internet, and headset checked", needsDocument: false },
  { label: "Talnt Team app installed on phone", needsDocument: false },
  { label: "Training completed", needsDocument: false }
];

/** Creates the default checklist the first time it's needed (also covers employees
 *  created before onboarding existed). */
export async function ensureOnboarding(employeeId: string) {
  const count = await prisma.onboardingItem.count({ where: { employeeId } });
  if (count > 0) return;
  await prisma.onboardingItem.createMany({
    data: DEFAULT_ONBOARDING.map((item, i) => ({ employeeId, sortOrder: i, ...item }))
  });
}

// ---------- Documents ----------

export const MAX_DOC_BYTES = 4 * 1024 * 1024; // keeps uploads under Vercel's request limit
export const ALLOWED_DOC_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/heic": "HEIC",
  "image/heif": "HEIF"
};

/** Validates and stores an uploaded file. Throws a plain-English error if it's not allowed. */
export async function saveDocument(opts: {
  employeeId: string;
  onboardingItemId: string | null;
  file: File;
  uploadedById: string;
}) {
  const { file } = opts;
  if (!file || typeof file === "string" || file.size === 0) throw new Error("Choose a file to upload.");
  if (!ALLOWED_DOC_TYPES[file.type]) throw new Error("Upload a PDF or a photo (JPG, PNG, WebP, HEIC).");
  if (file.size > MAX_DOC_BYTES) throw new Error("That file is over 4 MB. Try a smaller scan or photo.");

  if (opts.onboardingItemId) {
    const item = await prisma.onboardingItem.findFirst({
      where: { id: opts.onboardingItemId, employeeId: opts.employeeId }
    });
    if (!item) throw new Error("Checklist item not found.");
  }

  const fileName = (file.name || "document").replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return prisma.employeeDocument.create({
    data: {
      employeeId: opts.employeeId,
      onboardingItemId: opts.onboardingItemId,
      fileName,
      mimeType: file.type,
      size: file.size,
      data: Buffer.from(await file.arrayBuffer()),
      uploadedById: opts.uploadedById
    },
    select: { id: true }
  });
}
