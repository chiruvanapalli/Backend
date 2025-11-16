const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  imageUrl: String,
});

const foodCourtsSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  image: String,
  location: String,
  locationData: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },

  foodItems: [foodSchema],
});

foodCourtsSchema.index({ locationData: "2dsphere" });

module.exports = mongoose.model("FoodCourts", foodCourtsSchema);
