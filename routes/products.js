const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           description: URL to product image
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         price:
 *           type: number
 *         discountPrice:
 *           type: number
 *         category:
 *           type: string
 *         brand:
 *           type: string
 *         stock:
 *           type: number
 *         rating:
 *           type: number
 *         numOfReviews:
 *           type: number
 *       required:
 *         - name
 *         - price
 */

const serializeProduct = (product = {}) => ({
  name: product.name,
  image: product.image,
  description: product.description,
  location: product.location,
  price: product.price,
  discountPrice: product.discountPrice,
  category: product.category,
  brand: product.brand,
  stock: product.stock,
  rating: product.rating,
  numOfReviews: product.numOfReviews,
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create one or many products
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Product'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product(s) created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 *   get:
 *     summary: Fetch all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.post("/products", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    if (!payload.length) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    const invalid = payload.find(
      (product) =>
        !product ||
        !product.name ||
        product.price === undefined ||
        product.price === null
    );

    if (invalid) {
      return res.status(400).json({
        message: "Each product must include at least name and price",
      });
    }

    const docs = payload.map(serializeProduct);
    const created = await Product.insertMany(docs);
    return res.status(201).json(Array.isArray(req.body) ? created : created[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Fetch a single product by id
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/products/search", async (req, res) => {
  try {
    const { q, limit } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { restaurant: { $regex: q, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .limit(limit ? Number(limit) : 20)
      .sort({ _id: -1 });

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/restaurants/top", async (req, res) => {
  try {
    const restaurants = await Product.aggregate([
      {
        $group: {
          _id: "$restaurant",
          avgRating: { $avg: "$rating" },
          image: { $first: "$image" },
          location: { $first: "$location" },
          category: { $first: "$category" },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },

      // 👇 Rename _id to restaurant
      {
        $project: {
          _id: 0,
          restaurant: "$_id",
          avgRating: 1,
          image: 1,
          location: 1,
          category: 1,
        },
      },
    ]);

    return res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/:restaurantName/products
router.get("/restaurants/:restaurantName/products", async (req, res) => {
  try {
    const restaurantName = req.params.restaurantName;

    const products = await Product.find({
      restaurant: { $regex: `^${restaurantName}$`, $options: "i" },
    });

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
