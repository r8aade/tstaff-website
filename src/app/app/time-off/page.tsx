import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { calendarDate, fmtCalendarDate, ymdInTz } from "@/lib/time";
import { bankFor, fmtDays, requestHours, vacationEligibleFrom } from "@/lib/timeoff";
import StatusBadge from "@/components/employee/StatusBadge";
import TimeOffForm, { CancelTimeOffButton } from "@/components/employee/TimeOffForm";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  VACATION: "Vacation",
  SICK: "Sick",
  PERSONAL: "Personal",
  OTHER: "Other"
};

export default async function TimeOffPage() {
  const employee = await requireEmployee();
  const requests = await prisma.timeOffRequest.findMany({
    where: { employeeId: employee.id },
    orderBy: { startDate: "desc" },
    take: 30
  });

  const active = await prisma.timeOffRequest.findMany({
    where: { employeeId: employee.id, status: { in: ["PENDING", "APPROVED"] } }
  });
  const asOf = employee.balancesAsOf ? fmtCalendarDate(employee.balancesAsOf) : null;
  const vacation = { ...bankFor("VACATION", employee.vacationHours, employee.balancesAsOf, active), asOf };
  const sick = { ...bankFor("SICK", employee.sickHours, employee.balancesAsOf, active), asOf };
  const eligibleFrom = vacationEligibleFrom(employee.startDate);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-900">Time Off</h1>

      <TimeOffForm
        today={ymdInTz(new Date(), employee.timezone)}
        vacation={vacation}
        sick={sick}
        vacationEligibleFrom={eligibleFrom}
        vacationEligibleLabel={eligibleFrom ? fmtCalendarDate(calendarDate(eligibleFrom)) : null}
      />

      <section className="rounded-2xl border border-ink-900/10 bg-white p-4">
        <h2 className="font-semibold text-ink-900">My requests</h2>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-ink-700">No requests yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-ink-900/10">
            {requests.map((r) => {
              const same = r.startDate.getTime() === r.endDate.getTime();
              const days = Math.round((r.endDate.getTime() - r.startDate.getTime()) / 86400000) + 1;
              return (
                <li key={r.id} className="py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-900">
                        {fmtCalendarDate(r.startDate)}
                        {same ? "" : ` – ${fmtCalendarDate(r.endDate)}`}
                      </div>
                      <div className="text-ink-700">
                        {TYPE_LABEL[r.type]} · {fmtDays(requestHours(r))}
                        {days !== requestHours(r) / 8 ? ` (${days} calendar days)` : ""}
                      </div>
                      {r.reason && <p className="mt-1 break-words text-ink-700">{r.reason}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge status={r.status} />
                      {r.status === "PENDING" && <CancelTimeOffButton id={r.id} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
