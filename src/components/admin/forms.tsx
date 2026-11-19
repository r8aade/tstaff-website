"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  addAssignment,
  addManualEntry,
  assignToOverhead,
  restoreEmployee,
  rollOffEmployee,
  approveEntries,
  createAdmin,
  createEmployee,
  editEntry,
  endAssignment,
  rejectEntry,
  reopenEntry,
  resetPassword,
  reviewTimeOff,
  updateEmployee,
  updateIntake,
  type ActionResult
} from "@/app/admin/actions";
import { TIMEZONE_OPTIONS, COUNTRY_TIMEZONES } from "@/lib/time";

export const inputCls = "mt-1 w-full min-w-0 rounded-md border border-ink-900/15 bg-white px-3 py-2 text-base sm:text-sm";
const btnPrimary =
  "rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-ink-900/5 disabled:opacity-60";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function go(fn: () => Promise<ActionResult>, after?: (r: ActionResult & { ok: true }) => void) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
      else {
        after?.(r);
        router.refresh();
      }
    });
  }
  return { pending, error, go };
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 text-sm font-medium text-ink-900 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Err({ error }: { error: string | null }) {
  return error ? <p className="text-sm text-red-600">{error}</p> : null;
}

function TimezoneSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {TIMEZONE_OPTIONS.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}

// ---------- Employees ----------

export function NewEmployeeForm() {
  const router = useRouter();
  const { pending, error, go } = useAction();
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    title: "",
    country: "PH",
    timezone: "Asia/Manila",
    phone: "",
    payRate: ""
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: FormEvent) {
    e.preventDefault();
    go(() => createEmployee(f), (r) => router.push(`/admin/employees/${r.id}`));
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
      <Field label="Email (their login)"><input type="email" required value={f.email} onChange={set("email")} className={inputCls} /></Field>
      <Field label="Temporary password (8+ characters)"><input required minLength={8} value={f.password} onChange={set("password")} className={inputCls} /></Field>
      <Field label="Role / title"><input value={f.title} onChange={set("title")} placeholder="e.g. Customer Service Rep" className={inputCls} /></Field>
      <Field label="Country">
        <select
          value={f.country}
          onChange={(e) => setF({ ...f, country: e.target.value, timezone: COUNTRY_TIMEZONES[e.target.value] ?? f.timezone })}
          className={inputCls}
        >
          <option value="PH">Philippines</option>
          <option value="IN">India</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>
      <Field label="Their timezone"><TimezoneSelect value={f.timezone} onChange={(v) => setF({ ...f, timezone: v })} /></Field>
      <Field label="Phone"><input value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
      <Field label="Pay rate ($/hr, what Talnt pays them)">
        <input type="number" step="0.01" min="0" value={f.payRate} onChange={set("payRate")} className={inputCls} />
      </Field>
      <div className="sm:col-span-2 space-y-2">
        <Err error={error} />
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Creating..." : "Create Employee"}
        </button>
      </div>
    </form>
  );
}

export function EditEmployeeForm({
  employee
}: {
  employee: { id: string; name: string; title: string; country: string; timezone: string; phone: string; payRate: string; status: string };
}) {
  const { pending, error, go } = useAction();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState(employee);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setSaved(false);
    setF({ ...f, [k]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => updateEmployee(employee.id, f), () => setSaved(true));
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Full name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
      <Field label="Role / title"><input value={f.title} onChange={set("title")} className={inputCls} /></Field>
      <Field label="Country">
        <select value={f.country} onChange={set("country")} className={inputCls}>
          <option value="PH">Philippines</option>
          <option value="IN">India</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>
      <Field label="Their timezone"><TimezoneSelect value={f.timezone} onChange={(v) => setF({ ...f, timezone: v })} /></Field>
      <Field label="Phone"><input value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
      <Field label="Pay rate ($/hr)"><input type="number" step="0.01" min="0" value={f.payRate} onChange={set("payRate")} className={inputCls} /></Field>
      <Field label="Status">
        <select value={f.status} onChange={set("status")} className={inputCls}>
          <option value="ACTIVE">Active (can log in and clock in)</option>
          <option value="INACTIVE">Inactive (locked out)</option>
        </select>
      </Field>
      <div className="flex items-end gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-700">Saved.</span>}
        <Err error={error} />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const { pending, error, go } = useAction();
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => resetPassword(userId, pw), () => {
          setPw("");
          setDone(true);
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="New temporary password" className="flex-1">
        <input required minLength={8} value={pw} onChange={(e) => { setDone(false); setPw(e.target.value); }} className={inputCls} />
      </Field>
      <button type="submit" disabled={pending} className={btnGhost}>
        {pending ? "Saving..." : "Set Password"}
      </button>
      {done && <span className="text-sm text-green-700">Password changed. Send it to them privately.</span>}
      <div className="w-full"><Err error={error} /></div>
    </form>
  );
}

export function AssignForm({
  employeeId,
  clients
}: {
  employeeId: string;
  clients: { id: string; label: string; rate: string }[];
}) {
  const { pending, error, go } = useAction();
  const [clientId, setClientId] = useState("");
  const [rate, setRate] = useState("");
  if (clients.length === 0) {
    return <p className="text-sm text-ink-700">No clients yet. Create a client first, then assign this employee.</p>;
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => addAssignment(employeeId, clientId, rate), () => {
          setClientId("");
          setRate("");
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label="Client" className="flex-1">
        <select
          required
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setRate(clients.find((c) => c.id === e.target.value)?.rate ?? "");
          }}
          className={inputCls}
        >
          <option value="">Choose a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Client is billed ($/hr)">
        <input type="number" step="0.01" min="0" required value={rate} onChange={(e) => setRate(e.target.value)} className={`${inputCls} sm:w-32`} />
      </Field>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Assigning..." : "Assign"}
      </button>
      <div className="w-full"><Err error={error} /></div>
    </form>
  );
}

export function EndAssignmentButton({ id }: { id: string }) {
  const { pending, error, go } = useAction();
  return (
    <span className="inline-flex flex-col items-end">
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("End this assignment? Past hours stay on record.")) go(() => endAssignment(id));
        }}
        className="text-sm font-medium text-red-700 disabled:opacity-60"
      >
        {pending ? "Ending..." : "End"}
      </button>
      <Err error={error} />
    </span>
  );
}

export function ManualEntryForm({ assignments }: { assignments: { id: string; label: string }[] }) {
  const { pending, error, go } = useAction();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ assignmentId: assignments[0]?.id ?? "", clockIn: "", clockOut: "", breakMinutes: "0", notes: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  if (assignments.length === 0) return null;
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnGhost}>
        + Add missed shift
      </button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => addManualEntry(f), () => {
          setOpen(false);
          setF({ ...f, clockIn: "", clockOut: "", breakMinutes: "0", notes: "" });
        });
      }}
      className="grid gap-3 rounded-lg border border-ink-900/10 bg-white p-4 sm:grid-cols-2"
    >
      <p className="text-sm text-ink-700 sm:col-span-2">Enter times in Talnt time (US Central). It goes to Timesheets for approval.</p>
      <Field label="Client">
        <select value={f.assignmentId} onChange={set("assignmentId")} className={inputCls}>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Break (minutes)"><input type="number" min="0" value={f.breakMinutes} onChange={set("breakMinutes")} className={inputCls} /></Field>
      <Field label="Clock in"><input type="datetime-local" required value={f.clockIn} onChange={set("clockIn")} className={inputCls} /></Field>
      <Field label="Clock out"><input type="datetime-local" required value={f.clockOut} onChange={set("clockOut")} className={inputCls} /></Field>
      <Field label="Notes" className="sm:col-span-2"><input value={f.notes} onChange={set("notes")} className={inputCls} /></Field>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Adding..." : "Add Shift"}</button>
        <button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancel</button>
      </div>
      <div className="sm:col-span-2"><Err error={error} /></div>
    </form>
  );
}

// ---------- Timesheets ----------

export function BulkApproveButton({ ids }: { ids: string[] }) {
  const { pending, error, go } = useAction();
  if (ids.length === 0) return null;
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`Approve all ${ids.length} entries shown? They will be added to each client's bill.`)) go(() => approveEntries(ids));
        }}
        className={btnPrimary}
      >
        {pending ? "Approving..." : `Approve all (${ids.length})`}
      </button>
      <Err error={error} />
    </span>
  );
}

export function EntryActions({
  entry
}: {
  entry: { id: string; status: string; clockIn: string; clockOut: string; breakMinutes: number; notes: string };
}) {
  const { pending, error, go } = useAction();
  const [mode, setMode] = useState<"none" | "edit" | "reject">("none");
  const [f, setF] = useState({
    clockIn: entry.clockIn,
    clockOut: entry.clockOut,
    breakMinutes: String(entry.breakMinutes),
    notes: entry.notes
  });
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        {(entry.status === "SUBMITTED" || entry.status === "REJECTED") && (
          <button disabled={pending} onClick={() => go(() => approveEntries([entry.id]))} className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
            Approve
          </button>
        )}
        {entry.status === "SUBMITTED" && (
          <button disabled={pending} onClick={() => setMode(mode === "reject" ? "none" : "reject")} className={btnGhost}>
            Reject
          </button>
        )}
        {entry.status !== "APPROVED" && (
          <button disabled={pending} onClick={() => setMode(mode === "edit" ? "none" : "edit")} className={btnGhost}>
            {entry.status === "OPEN" ? "Clock out" : "Edit"}
          </button>
        )}
        {entry.status === "APPROVED" && (
          <button
            disabled={pending}
            onClick={() => {
              if (confirm("Undo approval? This removes these hours from the client's bill until re-approved.")) go(() => reopenEntry(entry.id));
            }}
            className={btnGhost}
          >
            Undo approval
          </button>
        )}
      </div>

      {mode === "reject" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(() => rejectEntry(entry.id, note), () => setMode("none"));
          }}
          className="flex gap-2"
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason (employee sees this)" className={inputCls} />
          <button type="submit" disabled={pending} className={btnGhost}>Send</button>
        </form>
      )}

      {mode === "edit" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(() => editEntry(entry.id, f), () => setMode("none"));
          }}
          className="grid gap-2 rounded-md border border-ink-900/10 bg-paper p-3 text-left sm:grid-cols-2"
        >
          <p className="text-xs text-ink-700 sm:col-span-2">Times are Talnt time (US Central).</p>
          <Field label="Clock in"><input type="datetime-local" required value={f.clockIn} onChange={(e) => setF({ ...f, clockIn: e.target.value })} className={inputCls} /></Field>
          <Field label="Clock out"><input type="datetime-local" required value={f.clockOut} onChange={(e) => setF({ ...f, clockOut: e.target.value })} className={inputCls} /></Field>
          <Field label="Break (min)"><input type="number" min="0" value={f.breakMinutes} onChange={(e) => setF({ ...f, breakMinutes: e.target.value })} className={inputCls} /></Field>
          <Field label="Notes"><input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={inputCls} /></Field>
          <div className="sm:col-span-2">
            <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Saving..." : "Save"}</button>
          </div>
        </form>
      )}
      <Err error={error} />
    </div>
  );
}

// ---------- Time off ----------

export function TimeOffReview({ id }: { id: string }) {
  const { pending, error, go } = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button disabled={pending} onClick={() => go(() => reviewTimeOff(id, true))} className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
          Approve
        </button>
        <button disabled={pending} onClick={() => go(() => reviewTimeOff(id, false))} className={btnGhost}>
          Deny
        </button>
      </div>
      <Err error={error} />
    </div>
  );
}

// ---------- Admins ----------

export function NewAdminForm() {
  const { pending, error, go } = useAction();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setDone(false); setF({ ...f, [k]: e.target.value }); };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => createAdmin(f), () => {
          setF({ name: "", email: "", password: "" });
          setDone(true);
        });
      }}
      className="grid gap-4 sm:grid-cols-3"
    >
      <Field label="Name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
      <Field label="Email"><input type="email" required value={f.email} onChange={set("email")} className={inputCls} /></Field>
      <Field label="Temporary password"><input required minLength={8} value={f.password} onChange={set("password")} className={inputCls} /></Field>
      <div className="flex items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Creating..." : "Create Admin"}</button>
        {done && <span className="text-sm text-green-700">Admin created.</span>}
        <Err error={error} />
      </div>
    </form>
  );
}

// ---------- Overhead ----------

export function AssignOverheadButton({ employeeId }: { employeeId: string }) {
  const { pending, error, go } = useAction();
  return (
    <span className="inline-flex flex-col gap-1">
      <button disabled={pending} onClick={() => go(() => assignToOverhead(employeeId))} className={btnGhost}>
        {pending ? "Assigning..." : "Assign to Talnt Staffing (Overhead)"}
      </button>
      <Err error={error} />
    </span>
  );
}

// ---------- Roll-off / archive ----------

const ROLL_OFF_REASONS = [
  "Resigned",
  "Let go (performance)",
  "Let go (conduct)",
  "Client ended engagement",
  "Contract finished",
  "No-show / abandoned",
  "Other"
];

export function RollOffForm({ employeeId, today }: { employeeId: string; today: string }) {
  const { pending, error, go } = useAction();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ endDate: today, reason: "", note: "", rehire: "yes" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
        Roll off employee
      </button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm("Roll off this employee? They lose login access, all client assignments end, and they move to the Archived tab. You can restore them later.")) {
          go(() => rollOffEmployee(employeeId, f));
        }
      }}
      className="grid gap-4 rounded-lg border border-red-200 bg-red-50/40 p-4 sm:grid-cols-2"
    >
      <Field label="Last day"><input type="date" required value={f.endDate} onChange={set("endDate")} className={inputCls} /></Field>
      <Field label="Reason">
        <select required value={f.reason} onChange={set("reason")} className={inputCls}>
          <option value="">Choose…</option>
          {ROLL_OFF_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Eligible for rehire?">
        <select value={f.rehire} onChange={set("rehire")} className={inputCls}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Not sure</option>
        </select>
      </Field>
      <Field label="Note (internal)"><input value={f.note} onChange={set("note")} className={inputCls} /></Field>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Rolling off..." : "Roll Off"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancel</button>
      </div>
      <div className="sm:col-span-2"><Err error={error} /></div>
    </form>
  );
}

export function RestoreEmployeeButton({ id }: { id: string }) {
  const { pending, error, go } = useAction();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Restore this employee? They can log in again. Assign them to a client so they can clock in.")) go(() => restoreEmployee(id));
        }}
        className={btnPrimary}
      >
        {pending ? "Restoring..." : "Restore employee"}
      </button>
      <Err error={error} />
    </span>
  );
}

export function IntakeStatusForm({ id, status, adminNote }: { id: string; status: string; adminNote: string }) {
  const { pending, error, go } = useAction();
  const [s, setS] = useState(status);
  const [note, setNote] = useState(adminNote);
  const [saved, setSaved] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        go(() => updateIntake(id, { status: s, adminNote: note }), () => setSaved(true));
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-ink-900">
        Status
        <select value={s} onChange={(e) => setS(e.target.value)} className={inputCls}>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed, talking to them</option>
          <option value="CONVERTED">Signed, now a client</option>
          <option value="CLOSED">Closed, not moving ahead</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-ink-900">
        Internal notes
        <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
      </label>
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving..." : "Save"}</button>
      {saved && !error && <p className="text-sm text-green-700">Saved.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
