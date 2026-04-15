
"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [usd, setUsd] = useState("");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [sats, setSats] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch BTC price in USD
  const fetchBtcPrice = async () => {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    setBtcPrice(res.data.bitcoin.usd);
    return res.data.bitcoin.usd;
  };

  // Convert USD to sats
  const convertToSats = (usdAmount: number, btcUsd: number) => {
    const btc = usdAmount / btcUsd;
    return Math.round(btc * 1e8); // 1 BTC = 100,000,000 sats
  };

  // Generate Lightning invoice
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setInvoice(null);
    setInvoiceUrl(null);
    try {
      const btcUsd = btcPrice || (await fetchBtcPrice());
      const usdAmount = parseFloat(usd);
      const satsAmount = convertToSats(usdAmount, btcUsd);
      setSats(satsAmount);

      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: satsAmount,
          description: `${name} - ${desc}`,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.paymentRequest) {
        setStatus(data.error || "Error generating invoice");
        setLoading(false);
        return;
      }

      setInvoice(data.paymentRequest);
      setInvoiceUrl(data.paymentUrl || null);
      setStatus("Waiting for payment...");
    } catch (err) {
      setStatus("Error generating invoice");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black py-8 px-2">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-zinc-900 dark:text-zinc-50">FlashPay</h1>
        <form className="flex flex-col gap-4" onSubmit={handleGenerateInvoice}>
          <input
            className="rounded border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-yellow-400 dark:focus:ring-yellow-500/30"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="rounded border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-yellow-400 dark:focus:ring-yellow-500/30"
            placeholder="Work description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
          />
          <input
            className="rounded border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-yellow-400 dark:focus:ring-yellow-500/30"
            placeholder="Amount in USD"
            type="number"
            min="1"
            value={usd}
            onChange={e => setUsd(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded mt-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Lightning Invoice"}
          </button>
        </form>
        {sats !== null && (
          <div className="mt-4 text-center text-zinc-700 dark:text-zinc-200">
            <span className="font-medium">You will receive:</span> {sats} sats
          </div>
        )}
        {invoice && (
          <div className="mt-6 flex flex-col items-center">
            <div className="mb-2 text-zinc-700 dark:text-zinc-200">Scan to pay:</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                invoice
              )}&size=200x200`}
              alt="Lightning Invoice QR"
              className="mb-2"
              width={200}
              height={200}
            />
            <div className="break-all text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              {invoice}
            </div>
            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                Open in wallet
              </a>
            )}
          </div>
        )}
        {status && (
          <div className="mt-4 text-center font-semibold text-lg text-red-600 dark:text-red-400">
            {status}
          </div>
        )}
        <div className="mt-8 text-center text-xs text-zinc-400">
          Powered by Alby & Lightning Network
        </div>
      </div>
    </div>
  );
}
