import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientSummary, formatCents } from "@/lib/billing";

export default async function AdminHomePage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" }
  });

  const summaries = await Promise.all(
    clients.map(async (c) => ({ client: c, summary: await getClientSummary(c.id) }))
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + New Client
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[0.03] text-left text-ink-700">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
              <th className="px-4 py-3 font-medium">Balance Due</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {summaries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-700">
                  No clients yet.
                </td>
              </tr>
            ) : (
              summaries.map(({ client, summary }) => (
                <tr key={client.id} className="border-t border-ink-900/10">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900">{client.name}</div>
                    <div className="text-xs text-ink-700">{client.email}</div>
                  </td>
                  <td className="px-4 py-3">{client.companyName ?? "—"}</td>
                  <td className="px-4 py-3">{formatCents(client.hourlyRateCents)}/hr</td>
                  <td className="px-4 py-3">{summary.totalHours.toFixed(2)}</td>
                  <td className="px-4 py-3">{formatCents(summary.balanceDueCents)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/clients/${client.id}`} className="font-medium text-brand-600">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
