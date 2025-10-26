// scripts/create_test_user.js
// Creates a test user directly in the database and prints user id and a JWT.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const name = process.argv[2] || 'Test User';
  const email = process.argv[3] || `testuser+${Date.now()}@example.com`;
  const password = process.argv[4] || 'password123';

  let existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', existing._id.toString());
    const token = jwt.sign({ id: existing._id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });
    console.log(JSON.stringify({ userId: existing._id.toString(), token }, null, 2));
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashed });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });
  console.log(JSON.stringify({ userId: user._id.toString(), token }, null, 2));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
