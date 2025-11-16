const mongoose = require("mongoose");
const Restaurant = require("../models/restaurants");
const data = require("../seeds/restaurant");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected");

  await Restaurant.deleteMany({});
  await Restaurant.insertMany(data);

  console.log("Inserted successfully");
  process.exit();
});
