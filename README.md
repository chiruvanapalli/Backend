# Backend (Express + MongoDB)

This repository provides a minimal e-commerce backend with auth, cart, wishlist, address, and order flows, plus a Stripe Checkout integration and webhook handler.

## Quick start (development)

1. Copy `.env.example` or create a `.env` in the project root with the required values:

```
MONGO_URI=mongodb://127.0.0.1:27017/myappdb
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # set after running stripe listen (see below)
```

2. Install deps and start the server:

```powershell
npm install
npm run dev
```

3. Create a test user (prints `{ userId, token }`):

```powershell
npm run create-test-user -- "Tester" tester@example.com password123
```

4. Create a Checkout session via the API (returns `orderId`, `sessionId`, `sessionUrl`):

Use your frontend to call the API with the JWT, or run the helper (reads token from a temporary file created by `create-test-user`):

```powershell
npm run create-order
```

Open `sessionUrl` in a browser to complete the Stripe Checkout (use card `4242 4242 4242 4242` for tests).

## Webhook testing (recommended)

To receive real webhook events from Stripe locally, use the Stripe CLI.

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli#install

2. Run the listener (in a separate terminal):

```powershell
stripe listen --forward-to localhost:5000/webhooks/stripe
```

The CLI prints a `Webhook signing secret` (starts with `whsec_...`). Add that value to your `.env` as `STRIPE_WEBHOOK_SECRET`.

3. Complete a Checkout session (open `sessionUrl`). The Stripe CLI will forward `checkout.session.completed` to your `/webhooks/stripe` endpoint and the server will mark the order as paid.

## Local-only simulation (no Stripe CLI)

For quick local testing without external tools, you can simulate webhook processing:

```powershell
npm run simulate:webhook
```

This creates a simulated order and runs the webhook processing logic directly against the DB to set `paymentStatus: 'paid'`.

## Useful npm scripts

- `npm run dev` - start server with nodemon
- `npm run create-test-user` - create test user
- `npm run create-order` - call the server to create a Checkout session (reads tmp user file if present)
- `npm run simulate:webhook` - simulate webhook processing locally
- `npm run stripe:listen` - convenience wrapper to run `stripe listen` (requires Stripe CLI)

## Notes & next steps

- In production, always verify webhook signatures (this project does) and move secrets to a secure store.
- Consider adding input validation, rate limiting, logging, and tests before deploying.

If you want, I can add a small `docker-compose` for running MongoDB + server locally, or add CI workflow with basic tests. Let me know which you'd like next.
