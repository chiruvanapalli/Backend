const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/popular");

const router = express.Router();

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
  restaurant: product.restaurant,
  tag: product.tag,
});

router.post("/popular-products", async (req, res) => {
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

router.get("/popular-products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/popular-products/:id", async (req, res) => {
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

module.exports = router;
