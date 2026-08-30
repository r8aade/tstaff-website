import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientSummary, formatCents } from "@/lib/billing";
import PayButtons from "@/components/PayButtons";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const { entries, payments, totalHours, balanceDueCents } = await getClientSummary(userId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Your Account</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-ink-900/10 bg-white p-6">
          <p className="text-sm text-ink-700">Total Hours Logged</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{totalHours.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-6">
          <p className="text-sm text-ink-700">Balance Due</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCents(balanceDueCents)}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-6 sm:col-span-1">
          <p className="mb-2 text-sm text-ink-700">Payments</p>
          <PayButtons balanceDueCents={balanceDueCents} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900">Hours</h2>
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

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900">Payment History</h2>
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
