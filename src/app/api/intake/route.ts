import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertHubspotContact } from "@/lib/hubspot";
import { sendIntakeNotification } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  ROLE_BY_ID,
  LEVELS,
  SHIFTS,
  START_OPTIONS,
  INDUSTRIES,
  SETUP_QUESTIONS,
  setupLines,
  setupQuestionShown,
  type IntakeRole,
  type SetupAnswers
} from "@/lib/roles";

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Same bot traps as the quote form: hidden honeypot field and a minimum fill time.
  // (The hidden box used to be called "company", which browser autofill filled for real people.)
  if (str(body.hpCheck)) {
    console.warn("Onboarding form blocked by spam trap (hidden box filled):", str(body.email) || "no email");
    return NextResponse.json({ ok: true });
  }
  if (typeof body.formLoadedAt === "number" && Date.now() - body.formLoadedAt < 5000) {
    console.warn("Onboarding form blocked by spam trap (sent too fast):", str(body.email) || "no email");
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json(
      { error: "The \"I'm human\" check didn't go through. Please tick it again and resend." },
      { status: 400 }
    );
  }

  const companyName = str(body.companyName, 150);
  const contactName = str(body.contactName, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const industry = str(body.industry, 120);
  const timezone = str(body.timezone, 80);
  if (!companyName || !contactName || !email || !phone || !industry || !timezone) {
    return NextResponse.json({ error: "Please fill in your business details." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const rawRoles = Array.isArray(body.roles) ? body.roles.slice(0, 15) : [];
  const roles: IntakeRole[] = [];
  for (const r of rawRoles as Record<string, unknown>[]) {
    const role = ROLE_BY_ID[str(r.roleId, 60)];
    if (!role) continue;
    const allowed = new Set(role.groups.flatMap((g) => g.skills));
    const skills = (Array.isArray(r.skills) ? r.skills : [])
      .map((s) => str(s, 80))
      .filter((s) => allowed.has(s));
    const headcount = Math.min(50, Math.max(1, Math.round(Number(r.headcount) || 1)));
    const hours = 40; // full time only for now
    roles.push({
      roleId: role.id,
      roleLabel: role.label,
      headcount,
      hoursPerWeek: hours,
      level: LEVELS.includes(str(r.level) as (typeof LEVELS)[number]) ? str(r.level) : LEVELS[1],
      shift: SHIFTS.includes(str(r.shift) as (typeof SHIFTS)[number]) ? str(r.shift) : SHIFTS[0],
      skills,
      otherSkills: str(r.otherSkills, 500),
      notes: str(r.notes, 1500)
    });
  }
  if (roles.length === 0) {
    return NextResponse.json({ error: "Add at least one role you want to hire for." }, { status: 400 });
  }

  // Setup answers: keep only known options, drop questions that don't apply
  // (e.g. phone system when they said no phone work), require the required ones.
  const rawSetup = (body.setup && typeof body.setup === "object" ? body.setup : {}) as Record<string, unknown>;
  const setup: SetupAnswers = {};
  for (const q of SETUP_QUESTIONS) {
    const a = (rawSetup[q.id] ?? {}) as Record<string, unknown>;
    const picks = (Array.isArray(a.picks) ? a.picks : []).map((p) => str(p, 80)).filter((p) => q.options.includes(p));
    setup[q.id] = { picks: q.multi ? Array.from(new Set(picks)) : picks.slice(0, 1), other: "" };
    if (q.otherOption && setup[q.id].picks.includes(q.otherOption)) setup[q.id].other = str(a.other, 200);
  }
  for (const q of SETUP_QUESTIONS) {
    if (!setupQuestionShown(q, setup)) {
      delete setup[q.id];
      continue;
    }
    if (q.required && setup[q.id].picks.length === 0) {
      return NextResponse.json({ error: `Please answer: ${q.label}` }, { status: 400 });
    }
    if (setup[q.id].picks.length === 0) delete setup[q.id];
  }
  const setupText = setupLines(setup)
    .map((l) => `${l.label} ${l.value}`)
    .join("\n");

  const startDate = START_OPTIONS.includes(str(body.startDate) as (typeof START_OPTIONS)[number]) ? str(body.startDate) : null;
  const intake = await prisma.clientIntake.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      website: str(body.website, 200) || null,
      industry: INDUSTRIES.includes(industry as (typeof INDUSTRIES)[number]) ? industry : industry.slice(0, 120),
      timezone,
      startDate,
      roles,
      setup,
      notes: str(body.notes, 3000) || null,
      heardFrom: str(body.heardFrom, 200) || null
    }
  });

  const headcount = roles.reduce((n, r) => n + r.headcount, 0);
  const summary = roles
    .map((r) => `${r.headcount} x ${r.roleLabel} (${r.hoursPerWeek}h/wk, ${r.level}): ${[...r.skills, r.otherSkills].filter(Boolean).join(", ")}`)
    .join("\n");

  const [firstName, ...rest] = contactName.split(/\s+/);
  try {
    await upsertHubspotContact({
      email,
      firstname: firstName,
      lastname: rest.join(" "),
      phone,
      business_type: industry,
      hours_per_week: roles.map((r) => `${r.hoursPerWeek}`).join(", "),
      preferred_timezone: timezone,
      resources_needed: String(headcount),
      requirements: `Onboarding form (${companyName})\n${summary}\n\nSetup:\n${setupText}`.slice(0, 5000)
    });
  } catch (err) {
    console.error("HubSpot sync failed for intake:", err);
  }

  try {
    await sendIntakeNotification({ id: intake.id, companyName, contactName, email, phone, industry, timezone, startDate, summary: `${summary}\n\nSetup:\n${setupText}` });
  } catch (err) {
    console.error("Intake notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
