import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature or secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      if (checkoutSession.mode === "payment") {
        await prisma.payment.updateMany({
          where: { stripeCheckoutSessionId: checkoutSession.id },
          data: {
            status: "SUCCEEDED",
            stripePaymentIntentId:
              typeof checkoutSession.payment_intent === "string"
                ? checkoutSession.payment_intent
                : checkoutSession.payment_intent?.id
          }
        });
      }

      if (checkoutSession.mode === "subscription" && checkoutSession.customer) {
        const customerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : checkoutSession.customer.id;

        const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.payment.create({
            data: {
              userId: user.id,
              amountCents: checkoutSession.amount_total ?? 0,
              type: "SUBSCRIPTION",
              status: "SUCCEEDED",
              stripeSubscriptionId:
                typeof checkoutSession.subscription === "string"
                  ? checkoutSession.subscription
                  : checkoutSession.subscription?.id
            }
          });
        }
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;

      // The first invoice of a subscription is already recorded via checkout.session.completed.
      if (invoice.billing_reason === "subscription_create") break;

      const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
      if (user) {
        await prisma.payment.create({
          data: {
            userId: user.id,
            amountCents: invoice.amount_paid,
            type: "SUBSCRIPTION",
            status: "SUCCEEDED",
            stripeSubscriptionId:
              typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id
          }
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
