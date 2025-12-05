const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true,
  },
  name: { type: String, required: true, index: true },
  desc: String,
  price: { type: Number, required: true }, // rupees
  veg: { type: Boolean, default: true },
  image: String,
  category: String, // e.g. "Biryani"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
