import { prisma } from "@/lib/prisma";

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export async function getClientSummary(userId: string) {
  const [entries, payments] = await Promise.all([
    prisma.hoursEntry.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  ]);

  const totalOwedCents = entries.reduce(
    (sum, e) => sum + Math.round(e.hours * e.rateCentsAtLog),
    0
  );
  const totalPaidCents = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const balanceDueCents = Math.max(totalOwedCents - totalPaidCents, 0);

  return { entries, payments, totalHours, totalOwedCents, totalPaidCents, balanceDueCents };
}
