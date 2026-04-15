import { NextResponse } from "next/server";
import axios from "axios";

const albyhubUrl = process.env.ALBYHUB_URL || "http://localhost:21420";

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, description } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "Missing invoice amount or description." }, { status: 400 });
  }

  try {
    // Call AlbyHub's local API to create an invoice
    const response = await axios.post(`${albyhubUrl}/api/invoices`, {
      amount,
      memo: description,
    });

    const paymentRequest = response.data.payment_request;
    const paymentUrl = response.data.payment_url || null;

    return NextResponse.json({ paymentRequest, paymentUrl });
  } catch (error: unknown) {
    console.error("AlbyHub invoice creation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to create invoice. Check if AlbyHub is running." },
      { status: 500 }
    );
  }
}
