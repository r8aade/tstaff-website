"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Turnstile, { TURNSTILE_SITE_KEY, type TurnstileHandle } from "@/components/Turnstile";
import {
  CATEGORIES,
  INDUSTRIES,
  LEVELS,
  ROLES,
  ROLE_BY_ID,
  SETUP_QUESTIONS,
  SHIFTS,
  START_OPTIONS,
  US_TIMEZONES,
  setupQuestionShown,
  type RoleDef,
  type SetupAnswers,
  type SetupQuestion
} from "@/lib/roles";

type RoleDraft = {
  key: number;
  roleId: string;
  headcount: number;
  hoursPerWeek: number;
  level: string;
  shift: string;
  skills: string[];
  otherSkills: string;
  notes: string;
};

const input =
  "mt-1 w-full min-w-0 rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-base text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelCls = "block min-w-0 text-sm font-medium text-ink-900";

function Section({ n, title, sub, children }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          {sub && <p className="mt-0.5 text-sm text-ink-700">{sub}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RolePicker({ onPick, exclude }: { onPick: (id: string) => void; exclude: string[] }) {
  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => {
        const roles = ROLES.filter((r) => r.category === cat && !exclude.includes(r.id));
        if (roles.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">{cat}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => onPick(r.id)}
                  className="rounded-xl border border-ink-900/10 bg-paper p-3 text-left transition hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="block font-semibold text-ink-900">{r.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-700">{r.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleCard({
  draft,
  role,
  index,
  onChange,
  onRemove
}: {
  draft: RoleDraft;
  role: RoleDef;
  index: number;
  onChange: (d: RoleDraft) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<RoleDraft>) => onChange({ ...draft, ...patch });
  const toggle = (skill: string) =>
    set({ skills: draft.skills.includes(skill) ? draft.skills.filter((s) => s !== skill) : [...draft.skills, skill] });
  const id = (f: string) => `role-${draft.key}-${f}`;

  return (
    <div className="rounded-xl border border-ink-900/10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Role {index + 1}</p>
          <h3 className="text-lg font-bold text-ink-900">{role.label}</h3>
          <p className="text-sm text-ink-700">{role.blurb}</p>
        </div>
        <button type="button" onClick={onRemove} className="shrink-0 text-sm font-medium text-ink-700 underline hover:text-red-700">
          Remove
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={labelCls} htmlFor={id("count")}>
          How many people
          <input
            id={id("count")}
            type="number"
            min={1}
            max={50}
            required
            className={input}
            value={draft.headcount}
            onChange={(e) => set({ headcount: Number(e.target.value) })}
          />
        </label>
        <div className={labelCls}>
          Hours per week, each
          <p className="mt-1 rounded-lg border border-ink-900/10 bg-paper px-3 py-2.5 text-base text-ink-900">40 (full time)</p>
        </div>
        <label className={labelCls} htmlFor={id("level")}>
          Experience
          <select id={id("level")} className={input} value={draft.level} onChange={(e) => set({ level: e.target.value })}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className={labelCls} htmlFor={id("shift")}>
          Working hours
          <select id={id("shift")} className={input} value={draft.shift} onChange={(e) => set({ shift: e.target.value })}>
            {SHIFTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <p className="text-sm font-medium text-ink-900">
          Tick the skills and tools this person needs{" "}
          <span className="font-normal text-ink-700">({draft.skills.length} picked)</span>
        </p>
        {role.groups.map((g) => (
          <fieldset key={g.name}>
            <legend className="text-xs font-semibold uppercase tracking-wide text-ink-700">{g.name}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.skills.map((s) => {
                const on = draft.skills.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={on}
                    onClick={() => toggle(s)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      on
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-900/15 bg-white text-ink-900 hover:border-brand-500"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className={labelCls} htmlFor={id("other")}>
          Other skills or software (optional)
          <input
            id={id("other")}
            className={input}
            placeholder="e.g. ServiceTitan, our own CRM"
            value={draft.otherSkills}
            onChange={(e) => set({ otherSkills: e.target.value })}
          />
        </label>
        <label className={labelCls} htmlFor={id("notes")}>
          What will they do day to day? (optional)
          <input
            id={id("notes")}
            className={input}
            placeholder="e.g. Answer the phone, book jobs, send invoices"
            value={draft.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

function SetupField({
  q,
  answer,
  onChange
}: {
  q: SetupQuestion;
  answer: { picks: string[]; other: string };
  onChange: (a: { picks: string[]; other: string }) => void;
}) {
  const choose = (opt: string) => {
    if (!q.multi) return onChange({ ...answer, picks: [opt] });
    onChange({
      ...answer,
      picks: answer.picks.includes(opt) ? answer.picks.filter((p) => p !== opt) : [...answer.picks, opt]
    });
  };
  const showOther = q.otherOption && answer.picks.includes(q.otherOption);
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-900">
        {q.label}
        {!q.required && <span className="font-normal text-ink-700"> (optional)</span>}
      </legend>
      {q.help && <p className="mt-0.5 text-xs text-ink-700">{q.help}</p>}
      <div className="mt-2 flex flex-wrap gap-2" role={q.multi ? "group" : "radiogroup"}>
        {q.options.map((opt) => {
          const on = answer.picks.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              role={q.multi ? undefined : "radio"}
              aria-pressed={q.multi ? on : undefined}
              aria-checked={q.multi ? undefined : on}
              onClick={() => choose(opt)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                on ? "border-brand-600 bg-brand-600 text-white" : "border-ink-900/15 bg-white text-ink-900 hover:border-brand-500"
              }`}
            >
              {on ? "✓ " : ""}
              {opt}
            </button>
          );
        })}
      </div>
      {showOther && (
        <input
          className={input}
          aria-label={`${q.label} (other)`}
          placeholder="Tell us which one"
          value={answer.other}
          onChange={(e) => onChange({ ...answer, other: e.target.value })}
        />
      )}
    </fieldset>
  );
}

const EMPTY_ANSWER = { picks: [] as string[], other: "" };

export default function ClientOnboardingForm() {
  const [biz, setBiz] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    industryOther: "",
    timezone: "",
    startDate: ""
  });
  const [roles, setRoles] = useState<RoleDraft[]>([]);
  const [picking, setPicking] = useState(true);
  const [setup, setSetup] = useState<SetupAnswers>({});
  const [notes, setNotes] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const loadedAt = useRef(Date.now());
  const [captcha, setCaptcha] = useState("");
  const captchaRef = useRef<TurnstileHandle>(null);
  const nextKey = useRef(1);

  const people = useMemo(() => roles.reduce((n, r) => n + (r.headcount || 0), 0), [roles]);

  function addRole(roleId: string) {
    setRoles((rs) => [
      ...rs,
      {
        key: nextKey.current++,
        roleId,
        headcount: 1,
        hoursPerWeek: 40,
        level: LEVELS[1],
        shift: SHIFTS[0],
        skills: [],
        otherSkills: "",
        notes: ""
      }
    ]);
    setPicking(false);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    if (roles.length === 0) {
      setError("Pick at least one role you want to hire for.");
      return;
    }
    const missing = SETUP_QUESTIONS.find(
      (q) => q.required && setupQuestionShown(q, setup) && !(setup[q.id]?.picks.length)
    );
    if (missing) {
      setError(`Please answer: ${missing.label}`);
      document.getElementById(`setup-${missing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (TURNSTILE_SITE_KEY && !captcha) {
      setError("Please complete the \"I'm human\" check just above the Send button.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...biz,
          industry: biz.industry === "Other" ? biz.industryOther : biz.industry,
          roles,
          setup,
          notes,
          heardFrom,
          hpCheck: company,
          turnstileToken: captcha,
          formLoadedAt: loadedAt.current
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      captchaRef.current?.reset(); // each check can only be used once
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-ink-900">Thanks, we have everything we need.</h2>
        <p className="mt-2 text-ink-700">
          We&apos;ll start matching candidates for your {people === 1 ? "new hire" : `${people} new hires`} and get back to
          you within one business day.
        </p>
      </div>
    );
  }

  const b = (k: keyof typeof biz) => ({
    value: biz[k],
    onChange: (e: { target: { value: string } }) => setBiz((v) => ({ ...v, [k]: e.target.value }))
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <label className="absolute left-[-9999px]" aria-hidden="true">
        Leave this box empty
        <input
          type="text"
          name="hp_check"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>

      <Section n={1} title="Your business">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Business name
            <input required className={input} autoComplete="organization" {...b("companyName")} />
          </label>
          <label className={labelCls}>
            Your name
            <input required className={input} autoComplete="name" {...b("contactName")} />
          </label>
          <label className={labelCls}>
            Email
            <input required type="email" className={input} autoComplete="email" {...b("email")} />
          </label>
          <label className={labelCls}>
            Phone
            <input required type="tel" className={input} autoComplete="tel" {...b("phone")} />
          </label>
          <label className={labelCls}>
            Industry
            <select required className={input} {...b("industry")}>
              <option value="" disabled>
                Select one
              </option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          {biz.industry === "Other" ? (
            <label className={labelCls}>
              What kind of business?
              <input required className={input} {...b("industryOther")} />
            </label>
          ) : (
            <label className={labelCls}>
              Website (optional)
              <input className={input} placeholder="yourbusiness.com" {...b("website")} />
            </label>
          )}
          <label className={labelCls}>
            Your timezone
            <select required className={input} {...b("timezone")}>
              <option value="" disabled>
                Select one
              </option>
              {US_TIMEZONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            When do you want them to start?
            <select required className={input} {...b("startDate")}>
              <option value="" disabled>
                Select one
              </option>
              {START_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section
        n={2}
        title="Who do you need?"
        sub="Pick a role, then tick the skills that matter. Every skill listed is one we regularly hire for in the Philippines."
      >
        <div className="space-y-4">
          {roles.map((d, i) => (
            <RoleCard
              key={d.key}
              draft={d}
              index={i}
              role={ROLE_BY_ID[d.roleId]}
              onChange={(nd) => setRoles((rs) => rs.map((r) => (r.key === d.key ? nd : r)))}
              onRemove={() => {
                setRoles((rs) => rs.filter((r) => r.key !== d.key));
                if (roles.length === 1) setPicking(true);
              }}
            />
          ))}

          {picking ? (
            <div className="rounded-xl bg-paper p-4">
              {roles.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-900">Add another role</p>
                  <button type="button" onClick={() => setPicking(false)} className="text-sm text-ink-700 underline">
                    Cancel
                  </button>
                </div>
              )}
              <RolePicker onPick={addRole} exclude={roles.map((r) => r.roleId)} />
              <p className="mt-4 text-sm text-ink-700">
                Don&apos;t see your role? Pick the closest one and describe it, or tell us in the last box.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="w-full rounded-xl border-2 border-dashed border-ink-900/15 px-4 py-3 text-sm font-semibold text-ink-900 hover:border-brand-500"
            >
              + Add another role
            </button>
          )}
        </div>
      </Section>

      <Section
        n={3}
        title="Your setup"
        sub="So we can match people who already know your tools, and have them ready to work on day one."
      >
        <div className="space-y-6">
          {SETUP_QUESTIONS.filter((q) => setupQuestionShown(q, setup)).map((q) => (
            <div key={q.id} id={`setup-${q.id}`} className="scroll-mt-24">
              <SetupField
                q={q}
                answer={setup[q.id] ?? EMPTY_ANSWER}
                onChange={(a) => setSetup((s) => ({ ...s, [q.id]: a }))}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section n={4} title="Anything else?">
        <div className="space-y-4">
          <label className={labelCls}>
            Anything we should know (optional)
            <textarea
              rows={4}
              className={input}
              placeholder="Main software they'll log into, how you'll train them, must-haves, deal breakers"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label className={labelCls}>
            How did you hear about us? (optional)
            <input className={input} value={heardFrom} onChange={(e) => setHeardFrom(e.target.value)} />
          </label>
        </div>
      </Section>

      {TURNSTILE_SITE_KEY && (
        <div className="flex justify-center">
          <Turnstile ref={captchaRef} onToken={setCaptcha} />
        </div>
      )}

      <div className="rounded-2xl bg-ink-900 p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm">
          {roles.length === 0
            ? "Add at least one role to send the form."
            : `${people} ${people === 1 ? "person" : "people"} across ${roles.length} ${roles.length === 1 ? "role" : "roles"}.`}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-3 w-full rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60 sm:mt-0 sm:w-auto"
        >
          {status === "sending" ? "Sending..." : "Send to Talnt Staffing"}
        </button>
      </div>
      {error && <p className="text-center text-sm font-medium text-red-700">{error}</p>}
    </form>
  );
}
