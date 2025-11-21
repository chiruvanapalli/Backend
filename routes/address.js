// routes/address.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Address = require("../models/Address");

// GET / - list addresses for user
router.get("/", auth, async (req, res) => {
  try {
    const addrs = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });
    res.json(addrs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST / - add address
router.post("/", auth, async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    if (payload.isDefault) {
      // unset other defaults
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    const addr = await Address.create(payload);
    res.status(201).json(addr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /:id - update address
router.put("/:id", auth, async (req, res) => {
  try {
    const payload = req.body;
    if (payload.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    const addr = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      payload,
      { new: true }
    );
    if (!addr) return res.status(404).json({ message: "Address not found" });
    res.json(addr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /:id - remove address
router.delete("/:id", auth, async (req, res) => {
  try {
    const addr = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!addr) return res.status(404).json({ message: "Address not found" });
    res.json({ message: "Address deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
