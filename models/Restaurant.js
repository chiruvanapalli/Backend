const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: String,
  image: String,
  location: String,
  rating: Number,
  cuisines: [String],
});

module.exports = mongoose.model("restaurants", restaurantSchema);
