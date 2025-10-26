// routes/wishlist.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

// GET / - get wishlist
router.get('/', auth, async (req, res) => {
  try {
    let wl = await Wishlist.findOne({ user: req.user.id });
    if (!wl) wl = await Wishlist.create({ user: req.user.id, items: [] });
    res.json(wl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /add - add item
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, name, price } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    let wl = await Wishlist.findOne({ user: req.user.id });
    if (!wl) wl = await Wishlist.create({ user: req.user.id, items: [] });
    if (!wl.items.find(i => i.productId === productId)) {
      wl.items.push({ productId, name, price });
      await wl.save();
    }
    res.json(wl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /remove
router.post('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    let wl = await Wishlist.findOne({ user: req.user.id });
    if (!wl) return res.status(404).json({ message: 'Wishlist not found' });
    wl.items = wl.items.filter(i => i.productId !== productId);
    await wl.save();
    res.json(wl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
