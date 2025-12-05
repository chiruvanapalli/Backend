const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant/Restaurant");
const MenuItem = require("../models/restaurant/MenuItem");
const mongoose = require("mongoose");

/**
 * GET /api/restaurants
 * Query:
 *  lat, lng  (required)    - user location
 *  radius    (optional)    - meters (default 5000)
 *  page, limit (optional)  - pagination
 *  sort (optional)         - 'distance'|'rating'|'relevance'
 *  cuisine, q (optional)   - filters
 */
router.get("/", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "lat and lng required" });
    }
    const radius = parseInt(req.query.radius || "5000", 10); // meters
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const skip = (page - 1) * limit;
    const cuisine = req.query.cuisine;
    const q = req.query.q; // search term
    const sort = req.query.sort || "distance";

    // Build match filter
    const match = {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };

    if (cuisine) match.cuisines = { $in: [cuisine] };
    if (q) match.$text = { $search: q }; // requires text index on name/zone/cuisines

    // aggregation to compute distance and do sorting/paging
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          maxDistance: radius,
          query: cuisine ? { cuisines: { $in: [cuisine] } } : {},
        },
      },
      // optional text match
      ...(q ? [{ $match: { $text: { $search: q } } }] : []),
      {
        $project: {
          name: 1,
          cuisines: 1,
          rating: 1,
          ratingCount: 1,
          avgDeliveryTimeMin: 1,
          costForTwo: 1,
          image: 1,
          location: 1,
          address: 1,
          zone: 1,
          distance: 1,
        },
      },
      // sorting
      ...(sort === "rating"
        ? [{ $sort: { rating: -1, ratingCount: -1 } }]
        : sort === "relevance" && q
        ? [{ $sort: { score: { $meta: "textScore" } } }]
        : [{ $sort: { distance: 1 } }]),
      { $skip: skip },
      { $limit: limit },
    ];

    const results = await Restaurant.aggregate(pipeline).exec();
    const total = results.length; // for simple usage; better to count with countCommand

    res.json({ data: results, page, limit, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurants/search
 * Query: lat,lng,q,page,limit
 * - Search restaurants by name/cuisine within radius
 */
router.get("/search", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ message: "q is required" });

    const radius = parseInt(req.query.radius || "5000", 10);
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const skip = (page - 1) * limit;

    // text index search + geo filter
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          maxDistance: radius,
          query: { $text: { $search: q } },
        },
      },
      {
        $project: {
          name: 1,
          cuisines: 1,
          rating: 1,
          address: 1,
          distance: 1,
          score: { $meta: "textScore" },
        },
      },
      { $sort: { score: { $meta: "textScore" }, distance: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const results = await Restaurant.aggregate(pipeline).exec();
    res.json({ data: results, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurants/:id
 * Get restaurant details and simple top menu items
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const restaurant = await Restaurant.findById(id).lean();
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    // fetch top menu items (limit 20)
    const menu = await MenuItem.find({ restaurant: id }).limit(50).lean();

    res.json({ restaurant, menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurants/:id/menu
 * Paginated menu items
 */
router.get("/:id/menu", async (req, res) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const skip = (page - 1) * limit;

    const menu = await MenuItem.find({ restaurant: id })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ data: menu, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
