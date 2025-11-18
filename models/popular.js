const mongoose = require("mongoose");

const popularSchema = new mongoose.Schema({
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
  tag: String,
});

module.exports = mongoose.model("popular", popularSchema);
