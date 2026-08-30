import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getClientSummary } from "@/lib/billing";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const { balanceDueCents } = await getClientSummary(user.id);

  if (balanceDueCents <= 0) {
    return NextResponse.json({ error: "No balance due." }, { status: 400 });
  }

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
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "TStaff — Outstanding Balance" },
          unit_amount: balanceDueCents
        },
        quantity: 1
      }
    ],
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/dashboard?payment=cancelled`
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      amountCents: balanceDueCents,
      type: "ONE_TIME",
      status: "PENDING",
      stripeCheckoutSessionId: checkoutSession.id
    }
  });

  return NextResponse.json({ url: checkoutSession.url });
}
