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

module.exports = mongoose.model("products", productSchema);
