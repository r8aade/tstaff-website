import { prisma } from "@/lib/prisma";
import { ensureOnboarding } from "@/lib/onboarding";
import { fmtDate } from "@/lib/time";

/** Loads an employee's checklist and documents in a shape the UI can use
 *  (file contents are never loaded here, only names and sizes). */
export async function loadOnboarding(employeeId: string, employeeUserId: string, tz: string) {
  await ensureOnboarding(employeeId);
  const [items, docs] = await Promise.all([
    prisma.onboardingItem.findMany({
      where: { employeeId },
      include: { completedBy: { select: { name: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    }),
    prisma.employeeDocument.findMany({
      where: { employeeId },
      select: { id: true, fileName: true, size: true, createdAt: true, uploadedById: true, onboardingItemId: true },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const toDoc = (d: (typeof docs)[number]) => ({
    id: d.id,
    fileName: d.fileName,
    size: d.size,
    uploadedAt: fmtDate(d.createdAt, tz),
    byEmployee: d.uploadedById === employeeUserId
  });

  return {
    items: items.map((i) => ({
      id: i.id,
      label: i.label,
      needsDocument: i.needsDocument,
      completedAt: i.completedAt ? fmtDate(i.completedAt, tz) : null,
      completedBy: i.completedBy?.name ?? null,
      docs: docs.filter((d) => d.onboardingItemId === i.id).map(toDoc)
    })),
    otherDocs: docs.filter((d) => !d.onboardingItemId).map(toDoc)
  };
}
