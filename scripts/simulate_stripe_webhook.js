// scripts/simulate_stripe_webhook.js
// Simulate a Stripe `checkout.session.completed` webhook locally by constructing
// a signed event using the webhook secret from .env and POSTing it to the
// /webhooks/stripe endpoint. This avoids requiring the Stripe CLI.

require('dotenv').config();
const crypto = require('crypto');
const fetch = global.fetch || require('node-fetch');
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function main() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  // Ensure we have a user to associate with the order. Use the create_test_user helper.
  const { spawnSync } = require('child_process');
  const created = spawnSync('node', ['scripts/create_test_user.js', 'Webhook Tester', `webhook+${Date.now()}@example.com`, 'password123'], { encoding: 'utf8' });
  if (created.error) throw created.error;
  const out = created.stdout || '';
  const idx = out.indexOf('{');
  if (idx === -1) throw new Error('Could not get JSON output from create_test_user');
  const jsonText = out.slice(idx);
  const createdUser = JSON.parse(jsonText);
  const userId = createdUser.userId;

  // Create or reuse a pending order with paymentProvider=stripe
  const order = await Order.create({
    user: userId,
    items: [],
    shippingAddress: { line1: 'Simulated', city: 'Local', country: 'US' },
    totalAmount: 0,
    status: 'pending',
    paymentProvider: 'stripe',
    paymentStatus: 'pending',
    paymentProviderId: `cs_test_sim_${Date.now()}`
  });

  // Build a Stripe session object and directly call the processing helper to
  // simulate the webhook without HTTP (avoids networking issues).
  const session = {
    id: order.paymentProviderId,
    object: 'checkout.session',
    payment_status: 'paid',
    metadata: { orderId: order._id.toString() }
  };

  console.log('Simulating webhook processing directly (no HTTP).');
  const webhookHandler = require('../routes/webhooks');
  await webhookHandler.processSessionObject(session);

  // Fetch the order to show it was updated
  const updated = await Order.findById(order._id).lean();
  console.log('Order after simulated webhook:', JSON.stringify(updated, null, 2));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
