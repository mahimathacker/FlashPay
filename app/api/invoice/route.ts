import { NextResponse } from "next/server";
import axios from "axios";

// Using OpenNode API instead
const opennodeApiKey = process.env.OPENNODE_API_KEY;

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, description } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "Missing invoice amount or description." }, { status: 400 });
  }

  if (!opennodeApiKey) {
    return NextResponse.json({ error: "Missing OPENNODE_API_KEY in environment." }, { status: 500 });
  }

  try {
    // Amount is already in sats as an integer
    const response = await axios.post("https://dev-api.opennode.co/v1/charges", {
      amount: Math.round(amount), // Ensure it's an integer
      description,
      currency: "BTC",
    }, {
      headers: {
        "Authorization": opennodeApiKey,
      },
    });

    const paymentRequest = response.data.data.lightning_invoice.payreq;
    const paymentUrl = null;

    return NextResponse.json({ paymentRequest, paymentUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("OpenNode invoice creation failed:", errorMessage);
    
    // If it's an axios error, get more details
    if (axios.isAxiosError(error)) {
      console.error("OpenNode response:", error.response?.data);
    }
    
    return NextResponse.json(
      { error: `OpenNode error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/* COMMENTED OUT: Previous AlbyHub implementation
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
*/
