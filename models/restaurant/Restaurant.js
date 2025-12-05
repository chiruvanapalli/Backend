// const mongoose = require("mongoose");

// const restaurantSchema = new mongoose.Schema({
//   name: String,
//   image: String,
//   location: String,
//   rating: Number,
//   cuisines: [String],
// });

// module.exports = mongoose.model("restaurants", restaurantSchema);

const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, index: true }, // optional friendly URL
  cuisines: [String],
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  open: { type: Boolean, default: true },
  avgDeliveryTimeMin: Number,
  costForTwo: Number, // in rupees
  image: String,
  zone: String, // optional area name (e.g. "Madhapur")
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
  },
  address: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
