import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClientSummary, formatCents } from "@/lib/billing";
import AddHoursForm from "@/components/AddHoursForm";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.user.findUnique({ where: { id: params.id } });
  if (!client || client.role !== "CLIENT") notFound();

  const { entries, payments, totalHours, balanceDueCents } = await getClientSummary(client.id);

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-600">
        &larr; Back to clients
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{client.name}</h1>
          <p className="text-sm text-ink-700">
            {client.email} {client.companyName ? `· ${client.companyName}` : ""} ·{" "}
            {formatCents(client.hourlyRateCents)}/hr
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-700">Balance Due</p>
          <p className="text-xl font-bold text-ink-900">{formatCents(balanceDueCents)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-ink-900/10 bg-white p-6">
        <h2 className="font-semibold text-ink-900">Log Hours</h2>
        <div className="mt-4">
          <AddHoursForm userId={client.id} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink-900">Hours ({totalHours.toFixed(2)} total)</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-700">
                    No hours logged yet.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="border-t border-ink-900/10">
                    <td className="px-4 py-3">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{e.description ?? "—"}</td>
                    <td className="px-4 py-3">{e.hours.toFixed(2)}</td>
                    <td className="px-4 py-3">{formatCents(e.rateCentsAtLog)}/hr</td>
                    <td className="px-4 py-3">{formatCents(Math.round(e.hours * e.rateCentsAtLog))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink-900">Payments</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-700">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-t border-ink-900/10">
                    <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{p.type === "ONE_TIME" ? "One-time" : "Subscription"}</td>
                    <td className="px-4 py-3">{formatCents(p.amountCents)}</td>
                    <td className="px-4 py-3 capitalize">{p.status.toLowerCase()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
