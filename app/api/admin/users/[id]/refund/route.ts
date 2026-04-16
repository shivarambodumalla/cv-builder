import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  lemonSqueezySetup,
  listSubscriptionInvoices,
  issueSubscriptionInvoiceRefund,
} from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { subscriptionId } = body as { subscriptionId?: string };

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "subscriptionId is required" },
      { status: 400 }
    );
  }

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

  const { data: invoices, error: listError } =
    await listSubscriptionInvoices({
      filter: { subscriptionId },
    });

  if (listError) {
    return NextResponse.json(
      { error: listError.message },
      { status: 500 }
    );
  }

  const latest = invoices?.data?.[0];

  if (!latest) {
    return NextResponse.json(
      { error: "No invoices found for this subscription" },
      { status: 404 }
    );
  }

  const invoiceId = latest.id;
  const amount = latest.attributes.total;

  const { error: refundError } = await issueSubscriptionInvoiceRefund(
    invoiceId,
    amount
  );

  if (refundError) {
    return NextResponse.json(
      { error: refundError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, invoiceId, amount });
}
