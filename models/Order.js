const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: Object }, // snapshot of address
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String },
    // Payment provider integration fields
    paymentProvider: { type: String }, // e.g. 'stripe'
    paymentProviderId: { type: String }, // provider's payment/session id
    paymentStatus: { type: String, enum: ['unpaid','pending','paid','failed'], default: 'unpaid' },
    paymentMeta: { type: Object }, // raw provider response for audit
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
