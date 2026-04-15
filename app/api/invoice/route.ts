import { NextResponse } from "next/server";
import { Client } from "@getalby/sdk";

const albyToken = process.env.ALBY_ACCESS_TOKEN;
if (!albyToken) {
  throw new Error("Missing ALBY_ACCESS_TOKEN environment variable.");
}

const client = new Client(albyToken);

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, description } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "Missing invoice amount or description." }, { status: 400 });
  }

  try {
    const invoice = await client.createInvoice({
      amount,
      description,
    });

    const paymentRequest = typeof invoice.payment_request === "string"
      ? invoice.payment_request
      : typeof invoice.paymentRequest === "string"
      ? invoice.paymentRequest
      : null;

    const paymentUrl = typeof invoice.payment_url === "string"
      ? invoice.payment_url
      : typeof invoice.paymentUrl === "string"
      ? invoice.paymentUrl
      : null;

    return NextResponse.json({ paymentRequest, paymentUrl });
  } catch (error: unknown) {
    console.error("Invoice creation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to create invoice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
