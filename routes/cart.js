// routes/cart.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');

// GET / - get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /add - add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;
    if (!productId || !price) return res.status(400).json({ message: 'productId and price required' });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({ productId, name, price, quantity: quantity || 1 });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /update - update quantity
router.post('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(i => i.productId === productId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /remove - remove item
router.post('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.productId !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /clear - clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { upsert: true });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
