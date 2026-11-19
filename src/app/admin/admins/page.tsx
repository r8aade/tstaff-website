import { prisma } from "@/lib/prisma";
import { NewAdminForm } from "@/components/admin/forms";

export default async function AdminsPage() {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Admins</h1>
        <p className="text-sm text-ink-700">Admins can manage clients, employees, timesheets, and time off.</p>
      </div>
      <ul className="divide-y divide-ink-900/10 rounded-lg border border-ink-900/10 bg-white">
        {admins.map((a) => (
          <li key={a.id} className="px-4 py-3 text-sm">
            <span className="font-medium text-ink-900">{a.name}</span>
            <span className="text-ink-700"> · {a.email}</span>
          </li>
        ))}
      </ul>
      <section className="rounded-lg border border-ink-900/10 bg-white p-6">
        <h2 className="font-semibold text-ink-900">Add an admin</h2>
        <div className="mt-4"><NewAdminForm /></div>
      </section>
    </div>
  );
}
