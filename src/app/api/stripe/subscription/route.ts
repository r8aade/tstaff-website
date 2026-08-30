import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getClientSummary } from "@/lib/billing";

// Default monthly-hours estimate used only when a client has no balance yet
// (i.e. setting up autopay before any hours are logged).
const DEFAULT_MONTHLY_HOURS = 40;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const { balanceDueCents } = await getClientSummary(user.id);

  const monthlyAmountCents =
    balanceDueCents > 0 ? balanceDueCents : user.hourlyRateCents * DEFAULT_MONTHLY_HOURS;

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id }
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "TStaff — Monthly Autopay" },
          unit_amount: monthlyAmountCents,
          recurring: { interval: "month" }
        },
        quantity: 1
      }
    ],
    success_url: `${appUrl}/dashboard?autopay=success`,
    cancel_url: `${appUrl}/dashboard?autopay=cancelled`
  });

  return NextResponse.json({ url: checkoutSession.url });
}
