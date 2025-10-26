const mongoose = require('mongoose');

const wishItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String },
  price: { type: Number },
  addedAt: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [wishItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
