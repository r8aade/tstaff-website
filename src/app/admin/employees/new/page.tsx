import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tzLabel } from "@/lib/time";
import { NewEmployeeForm } from "@/components/admin/forms";

export default async function NewEmployeePage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: [{ isInternal: "desc" }, { name: "asc" }],
    select: { id: true, name: true, companyName: true, timezone: true }
  });

  return (
    <div>
      <Link href="/admin/employees" className="text-sm text-brand-600">&larr; Back to employees</Link>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">New Employee</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-700">
        They sign in at talntstaffing.com/login with this email and password, then add the app to their phone&apos;s
        home screen. Pick their client now, or assign them later, so they can clock in. Their app shows each shift in
        both their own time and the client&apos;s time.
      </p>
      <div className="mt-6 max-w-3xl rounded-lg border border-ink-900/10 bg-white p-6">
        <NewEmployeeForm
          clients={clients.map((c) => ({
            id: c.id,
            label: c.companyName || c.name || "Unnamed client",
            timezone: c.timezone,
            timezoneLabel: tzLabel(c.timezone)
          }))}
        />
      </div>
    </div>
  );
}
