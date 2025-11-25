const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  restaurant: String,
  image: String,
  description: String,
  location: String,
  price: Number,
  discountPrice: Number,
  category: String,
  brand: String,
  stock: Number,
  rating: Number,
  numOfReviews: Number,
});

// ADD THIS FOR FAST SEARCH
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
  restaurant: "text",
});

module.exports = mongoose.model("products", productSchema);
