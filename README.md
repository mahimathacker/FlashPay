
# FlashPay

A simple web app to solve cross-border payment fees using the Lightning Network.

## Features
- Enter name, work description, and amount in USD
- Fetches live Bitcoin price from CoinGecko
- Converts USD to sats
- Generates a Lightning invoice QR code using Alby SDK
- Shows payment status in real time
- Clean, simple UI with Tailwind CSS

## Tech Stack
- Next.js (TypeScript)
- Tailwind CSS
- @getalby/sdk, @getalby/bitcoin-connect
- Axios

## Usage
1. Install dependencies: `npm install`
2. Run the app: `npm run dev`
3. Open http://localhost:3000

No authentication or database required.

---

Resources:
- [Alby SDK docs](https://getalby.com/developers)
- [Alby GitHub](https://github.com/getAlby/js-sdk)
- [Lightning address docs](https://lightningaddress.com)
- [Alby hub for testing](https://albyhub.com)
