// scripts/confirm_order.js
// Usage: node scripts/confirm_order.js <orderId>
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function main() {
  const orderId = process.argv[2];
  if (!orderId) { console.error('Usage: node scripts/confirm_order.js <orderId>'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const order = await Order.findById(orderId);
  if (!order) { console.error('Order not found'); process.exit(1); }
  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  await order.save();
  console.log(JSON.stringify(order, null, 2));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
