import { calendarDate, fmtCalendarDate } from "@/lib/time";
import { bankFor, fmtDays, fmtHrs, requestHours, vacationEligibleFrom } from "@/lib/timeoff";

type Req = { id: string; type: string; status: string; startDate: Date; endDate: Date };

/** Under a pending time off request: how many hours it is, what's left in the bank, and eligibility. */
export default function TimeOffBankNote({
  request,
  employee
}: {
  request: Req;
  employee: {
    startDate: Date | null;
    vacationHours: number | null;
    sickHours: number | null;
    balancesAsOf: Date | null;
    timeOff: Req[];
  };
}) {
  const hours = requestHours(request);
  const parts: { text: string; bad?: boolean }[] = [{ text: `${fmtDays(hours)} (${fmtHrs(hours)})` }];

  if (request.type === "VACATION" || request.type === "SICK") {
    const isVac = request.type === "VACATION";
    const bank = bankFor(
      isVac ? "VACATION" : "SICK",
      isVac ? employee.vacationHours : employee.sickHours,
      employee.balancesAsOf,
      employee.timeOff.filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    );
    if (bank.available == null) parts.push({ text: `${isVac ? "vacation" : "sick"} balance not entered from Gusto` });
    else if (bank.available <= 0 && bank.balance - bank.approvedSince - bank.pending < 0)
      parts.push({ text: `over the bank by ${fmtHrs(bank.pending + bank.approvedSince - bank.balance)}, Gusto won't pay that part`, bad: true });
    else parts.push({ text: `leaves ${fmtHrs(bank.available)} in the ${isVac ? "vacation" : "sick"} bank` });
  }

  if (request.type === "VACATION") {
    const from = vacationEligibleFrom(employee.startDate);
    if (!from) parts.push({ text: "start date not set", bad: true });
    else if (request.startDate.toISOString().slice(0, 10) < from)
      parts.push({ text: `not eligible until ${fmtCalendarDate(calendarDate(from))}`, bad: true });
    else parts.push({ text: "eligible" });
  }

  return (
    <p className="text-xs text-ink-700">
      {parts.map((p, i) => (
        <span key={i} className={p.bad ? "font-semibold text-red-700" : undefined}>
          {i > 0 ? " · " : ""}
          {p.text}
        </span>
      ))}
    </p>
  );
}
