# TStaff — talntstaffing.com

Marketing site + client portal for TStaff. Clients log in to see hours worked
and pay their balance or set up autopay; you (admin) log in to add clients and
log hours.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind, Prisma + Postgres,
NextAuth (credentials login), Stripe (one-time + recurring payments).

## What's built

- Marketing pages: home, services, about, contact
- Client login (`/login`) → dashboard showing hours, balance due, payment
  history, "Pay Balance Now" and "Set Up Autopay" buttons
- Admin area (`/admin`, admin-role only): add clients, log hours per client
- Stripe Checkout for one-time balance payments and monthly autopay
  subscriptions, plus a webhook that records successful payments

## 1. Local setup (optional — you can skip straight to deploying)

This machine doesn't have Node.js installed. If you want to run this locally
before deploying:

1. Install [Node.js 20 LTS](https://nodejs.org/)
2. `npm install`
3. Copy `.env.example` to `.env` and fill in a `DATABASE_URL` (see step 2
   below), a random `NEXTAUTH_SECRET`, and your Stripe test keys
4. `npm run db:push` to create the database tables
5. `npm run db:seed` to create an admin login (`admin@talntstaffing.com` /
   `ChangeMe123!` by default — override with `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` env vars, and change the password after first login)
6. `npm run dev` and open http://localhost:3000

## 2. Database (Postgres)

Create a free Postgres database at [Neon](https://neon.tech) or
[Supabase](https://supabase.com) — either works. Copy the connection string
into `DATABASE_URL`.

## 3. Deploy to Vercel

1. Push this project to a new GitHub repository
2. In [Vercel](https://vercel.com), "Add New Project" → import that repo
   (Next.js is auto-detected, no config needed)
3. Under **Settings → Environment Variables**, add everything from
   `.env.example` with real values:
   - `DATABASE_URL` — your Neon/Supabase connection string
   - `NEXTAUTH_URL` — `https://talntstaffing.com`
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from your
     Stripe dashboard (API keys)
   - `STRIPE_WEBHOOK_SECRET` — see step 5
   - `NEXT_PUBLIC_APP_URL` — `https://talntstaffing.com`
4. Deploy. After the first deploy, run the database setup once (from your
   own machine, pointed at the same `DATABASE_URL`):
   ```
   npm run db:push
   npm run db:seed
   ```

## 4. Point talntstaffing.com at Vercel

In the Vercel project → **Settings → Domains**, add `talntstaffing.com`
(and `www.talntstaffing.com`). Vercel gives you the DNS records to add at
your domain registrar — usually an `A` record for the root domain and a
`CNAME` for `www`.

## 5. Stripe setup

1. Create a [Stripe](https://dashboard.stripe.com) account for TStaff (or
   use your existing one). Start in **test mode**.
2. Copy the test **Secret key** and **Publishable key** into Vercel's env
   vars (step 3).
3. **Developers → Webhooks → Add endpoint**: URL is
   `https://talntstaffing.com/api/stripe/webhook`, and select these events:
   - `checkout.session.completed`
   - `invoice.paid`
4. Copy the webhook's **Signing secret** into `STRIPE_WEBHOOK_SECRET` in
   Vercel.
5. Test a payment with Stripe's test card `4242 4242 4242 4242`, any future
   expiry, any CVC.
6. Once you're ready for real payments, switch Stripe to **live mode** and
   swap in the live keys (repeat steps 2–4 with live values).

## Notes / known simplifications

- **Client accounts are created by you**, not self-signup — add clients from
  `/admin/clients/new`, which sets a temporary password. There's no
  password-reset flow yet; if a client forgets their password, reset it
  directly by editing their row in the database, or ask and I'll add a
  proper reset flow.
- **Autopay amount**: the recurring subscription amount is set to the
  client's current balance due at signup (or a 40-hour estimate at their
  hourly rate if there's no balance yet). It's a fixed monthly amount from
  then on — it does not automatically track new hours. If you want autopay
  to always match the latest hours logged, that needs usage-based Stripe
  billing, which is a bigger addition — let me know if you want it built.
- **Hours are entered manually** by an admin. If your staff already use a
  time tracker (Hubstaff, Toggl, etc.), hours entry could be automated from
  that later.
