const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// This file exports a raw handler for Stripe webhooks. It expects the raw
// request body so signature verification works. Register it in server.js as:
// app.post('/webhooks/stripe', express.raw({type: 'application/json'}), require('./routes/webhooks'));

async function processSessionObject(session) {
  try {
    const order = await Order.findOne({ paymentProviderId: session.id, paymentProvider: 'stripe' });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentMeta = session;
      await order.save();
      // TODO: enqueue fulfillment, send confirmation email, etc.
    }
    return order;
  } catch (e) {
    console.error('Error updating order from webhook:', e);
    throw e;
  }
}

// Raw webhook handler that verifies signature then delegates to processing logic.
module.exports = async function (req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await processSessionObject(session);
    } catch (e) {
      // already logged in processSessionObject
    }
  }

  res.json({ received: true });
};

// Export helper for local testing without signature verification
module.exports.processSessionObject = processSessionObject;
