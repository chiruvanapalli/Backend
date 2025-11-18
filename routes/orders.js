// routes/orders.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Address = require("../models/Address");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// POST /create - create order from cart or from provided items
router.post("/create", auth, async (req, res) => {
  try {
    // Either provide addressId or shippingAddress in body
    const { addressId, shippingAddress, items: providedItems } = req.body;

    let items = providedItems;
    if (!items) {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart || !cart.items.length)
        return res.status(400).json({ message: "Cart is empty" });
      items = cart.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
    }

    let ship = shippingAddress;
    if (addressId) {
      const addr = await Address.findOne({ _id: addressId, user: req.user.id });
      if (!addr)
        return res.status(400).json({ message: "Shipping address not found" });
      ship = addr.toObject();
      delete ship._id;
    }

    const totalAmount = items.reduce(
      (s, it) => s + (it.price || 0) * (it.quantity || 1),
      0
    );

    // Create order in DB with pending payment status
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress: ship,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
      paymentProvider: "stripe",
    });

    // Create Stripe Checkout Session
    // Convert items to Stripe line_items
    const line_items = items.map((i) => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name || "Item" },
        unit_amount: Math.round((i.price || 0) * 100),
      },
      quantity: i.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/checkout-cancel`,
      metadata: { orderId: order._id.toString() },
    });

    // Save Stripe session id and session metadata on order for later verification in webhook
    order.paymentProviderId = session.id;
    order.paymentMeta = session;
    await order.save();

    // Optionally clear cart after creating order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    // Return session URL as well so clients without Stripe.js can redirect
    res
      .status(201)
      .json({
        orderId: order._id,
        sessionId: session.id,
        sessionUrl: session.url,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET / - list user's orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /:id - order details
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /:id/cancel - cancel pending order
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /:id/confirm - mark order as paid/confirmed (placeholder for payment)
// In a real integration this would be called after payment gateway confirms payment.
router.post("/:id/confirm", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending orders can be confirmed" });
    order.paymentStatus = "paid";
    order.status = "confirmed";
    // paymentMethod can be passed in body when integrating
    if (req.body.paymentMethod) order.paymentMethod = req.body.paymentMethod;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
