// scripts/find_sim_orders.js
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function main(){
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find({ paymentProvider: 'stripe', paymentProviderId: /cs_test_sim_/ }).sort({ createdAt: -1 }).limit(10).lean();
  console.log(JSON.stringify(orders, null, 2));
  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
