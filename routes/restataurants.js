const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("../models/restaurants");

const router = express.Router();

// GET http://localhost:5000/api/restaurants?lat=30.2672&lng=-97.7431

const normalizeLocationData = (restaurant) => {
  const toPoint = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

    const [lng, lat] = coordinates.map((value) =>
      typeof value === "string" ? Number(value) : value
    );

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { type: "Point", coordinates: [lng, lat] };
  };

  if (restaurant.locationData) {
    const point = toPoint(restaurant.locationData.coordinates);
    if (point) return point;
  }

  if (Array.isArray(restaurant.coordinates)) {
    const point = toPoint(restaurant.coordinates);
    if (point) return point;
  }

  if (
    restaurant.lat !== undefined &&
    restaurant.lng !== undefined &&
    restaurant.lat !== null &&
    restaurant.lng !== null
  ) {
    const lat = Number(restaurant.lat);
    const lng = Number(restaurant.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { type: "Point", coordinates: [lng, lat] };
    }
  }

  return undefined;
};

// GET restaurants by location or coordinates
router.get("/", async (req, res) => {
  const { location, lat, lng } = req.query;

  try {
    if (lat && lng) {
      const latitude = Number(lat);
      const longitude = Number(lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res
          .status(400)
          .json({ message: "lat and lng must be valid numbers" });
      }

      const restaurants = await Restaurant.find({
        locationData: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: 20000,
          },
        },
      });

      return res.status(200).json(restaurants);
    }

    if (location) {
      const restaurants = await Restaurant.find({
        location: { $regex: location, $options: "i" },
      });

      return res.status(200).json(restaurants);
    }

    return res
      .status(400)
      .json({ message: "Location or coordinates required" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single restaurant by Mongo _id or custom id field
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let restaurant = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id);
    }

    if (!restaurant) {
      restaurant = await Restaurant.findOne({ id });
    }

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json(restaurant);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST create one or more restaurants
router.post("/", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];

    if (!payload.length) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    const invalid = payload.find(
      (restaurant) =>
        !restaurant.name ||
        !restaurant.description ||
        !restaurant.image ||
        !restaurant.foodItems
    );

    if (invalid) {
      return res.status(400).json({
        message:
          "Each restaurant must include name, description, image, and foodItems",
      });
    }

    const docs = payload.map((restaurant) => {
      const doc = {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        image: restaurant.image,
        location: restaurant.location,
        foodItems: restaurant.foodItems,
      };

      const locationData = normalizeLocationData(restaurant);
      if (locationData) {
        doc.locationData = locationData;
      }

      return doc;
    });

    const created = await Restaurant.insertMany(docs);
    return res.status(201).json(Array.isArray(req.body) ? created : created[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
