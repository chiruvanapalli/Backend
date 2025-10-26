// scripts/call_create_order.js
// Read token from tmp_user.json and call POST /api/orders/create to generate a Stripe Checkout session
require('dotenv').config();
const fs = require('fs');
const fetch = global.fetch || require('node-fetch');

async function main(){
  // Create a test user by spawning the create_test_user script and capture its stdout.
  const { spawnSync } = require('child_process');
  const created = spawnSync('node', ['scripts/create_test_user.js', 'Automated Tester', 'testuser+callorder@example.com', 'password123'], { encoding: 'utf8' });
  if (created.error) throw created.error;
  const out = created.stdout || '';
  // stdout may contain dotenv logs before the JSON body. Find the first '{' and parse from there.
  const idx = out.indexOf('{');
  if (idx === -1) throw new Error('Could not find JSON output from create_test_user');
  const jsonText = out.slice(idx);
  const obj = JSON.parse(jsonText);
  const token = obj.token;

  const body = { items: [{ productId: 'p1', name: 'Demo Item', price: 19.99, quantity: 1 }] };

  const res = await fetch('http://localhost:5000/api/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  try { console.log(JSON.parse(text)); } catch(e) { console.log(text); }
}

main().catch(err=>{ console.error(err); process.exit(1); });
