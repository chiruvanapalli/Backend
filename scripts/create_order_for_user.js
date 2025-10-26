// scripts/create_order_for_user.js
// Usage: node scripts/create_order_for_user.js <userId> '<itemsJson>'
// Example itemsJson: '[{"productId":"p1","name":"T-Shirt","price":29.99,"quantity":2}]'
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function main() {
  const userId = process.argv[2];
  const itemsJson = process.argv[3] || '[]';
  if (!userId) {
    console.error('Usage: node scripts/create_order_for_user.js <userId> "<itemsJson>"');
    process.exit(1);
  }
  const items = JSON.parse(itemsJson);

  await mongoose.connect(process.env.MONGO_URI);

  const totalAmount = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress: { line1: 'Test address', city: 'Test', country: 'Test' },
    totalAmount,
    status: 'pending',
    paymentStatus: 'pending',
    paymentProvider: 'manual'
  });

  console.log(JSON.stringify(order, null, 2));
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
