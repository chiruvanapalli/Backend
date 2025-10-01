// routes/public.js
const express = require("express");
const router = express.Router();

// Sample data (10 objects)
const products = [
  {
    id: "1",
    name: "Raja Food Court",
    imageId: "75f8103a06f57c043f26343fa42e23e2",
    locality: "Nizampet & Pragathi Nagar",
    areaName: "Nizampet & Pragathi Nagar",
    costForTwo: "₹300",
    cuisines: ["Biryani", "South Indian"],
    avgRating: 3,
    parentId: "566385",
    avgRatingString: "3.0",
    totalRatingsString: "8",
    availability: {
      nextCloseTime: "2025-09-21 23:15:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "2",
    name: "Spicy Biryani House",
    imageId: "571021f2cf69280e632e15fed5cb686d",
    locality: "Madhapur",
    areaName: "HiTech City",
    costForTwo: "₹400",
    cuisines: ["Biryani", "North Indian"],
    avgRating: 4.2,
    parentId: "566386",
    avgRatingString: "4.2",
    totalRatingsString: "120",
    availability: {
      nextCloseTime: "2025-09-21 23:59:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "3",
    name: "Punjabi Tandoor",
    imageId: "fhlawfoalrnoussx2m7t",
    locality: "Kukatpally",
    areaName: "KPHB",
    costForTwo: "₹350",
    cuisines: ["Punjabi", "Tandoor", "North Indian"],
    avgRating: 4.5,
    parentId: "566387",
    avgRatingString: "4.5",
    totalRatingsString: "85",
    availability: {
      nextCloseTime: "2025-09-21 22:30:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "4",
    name: "Andhra Spice",
    imageId:
      "RX_THUMBNAIL/IMAGES/VENDOR/2025/5/13/1916aabd-360d-4050-a506-eb82f1e7323b_441530.jpg",
    locality: "Ameerpet",
    areaName: "SR Nagar",
    costForTwo: "₹250",
    cuisines: ["Andhra", "South Indian"],
    avgRating: 3.8,
    parentId: "566388",
    avgRatingString: "3.8",
    totalRatingsString: "60",
    availability: {
      nextCloseTime: "2025-09-21 22:00:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "5",
    name: "Domino’s Pizza",
    imageId:
      "RX_THUMBNAIL/IMAGES/VENDOR/2024/12/6/8b43ab2d-d227-4f86-bbee-859e05dc24ce_1691.ss.jpg",
    locality: "Kondapur",
    areaName: "Gachibowli",
    costForTwo: "₹600",
    cuisines: ["Pizza", "Italian"],
    avgRating: 4.0,
    parentId: "566389",
    avgRatingString: "4.0",
    totalRatingsString: "1000",
    availability: {
      nextCloseTime: "2025-09-21 23:45:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "6",
    name: "KFC",
    imageId: "wrhehhn7s97wc6mkqqff",
    locality: "Banjara Hills",
    areaName: "Road No. 12",
    costForTwo: "₹500",
    cuisines: ["Chicken", "Fast Food"],
    avgRating: 4.1,
    parentId: "566390",
    avgRatingString: "4.1",
    totalRatingsString: "500",
    availability: {
      nextCloseTime: "2025-09-21 23:59:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "7",
    name: "Burger King",
    imageId:
      "RX_THUMBNAIL/IMAGES/VENDOR/2024/11/25/3ffa6800-c3c2-4f78-8c5b-7cb865b57d84_995708.jpg",
    locality: "Secunderabad",
    areaName: "MG Road",
    costForTwo: "₹400",
    cuisines: ["Burgers", "Fast Food"],
    avgRating: 4.3,
    parentId: "566391",
    avgRatingString: "4.3",
    totalRatingsString: "750",
    availability: {
      nextCloseTime: "2025-09-21 23:30:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "8",
    name: "Chinese Dragon",
    imageId:
      "RX_THUMBNAIL/IMAGES/VENDOR/2025/7/4/3b2a4a16-92df-443c-8fda-78eebeee0233_1129269.jpg",
    locality: "Madhapur",
    areaName: "HiTech City",
    costForTwo: "₹450",
    cuisines: ["Chinese", "Asian"],
    avgRating: 4.4,
    parentId: "566392",
    avgRatingString: "4.4",
    totalRatingsString: "340",
    availability: {
      nextCloseTime: "2025-09-21 22:45:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "9",
    name: "Grill House",
    imageId:
      "RX_THUMBNAIL/IMAGES/VENDOR/2024/11/19/34659f42-429b-4ba8-8f02-2844c2eb7afb_993620.jpg",
    locality: "Miyapur",
    areaName: "Miyapur",
    costForTwo: "₹550",
    cuisines: ["Grill", "Barbecue"],
    avgRating: 4.6,
    parentId: "566393",
    avgRatingString: "4.6",
    totalRatingsString: "200",
    availability: {
      nextCloseTime: "2025-09-21 23:10:00",
      opened: true,
    },
    isOpen: true,
  },
  {
    id: "10",
    name: "Taj Mahal Hotel",
    imageId: "8747a4eee2e900d0cb848e5d6489c966",
    locality: "Abids",
    areaName: "Hyderabad",
    costForTwo: "₹350",
    cuisines: ["Indian", "South Indian"],
    avgRating: 4.0,
    parentId: "566394",
    avgRatingString: "4.0",
    totalRatingsString: "600",
    availability: {
      nextCloseTime: "2025-09-21 21:30:00",
      opened: true,
    },
    isOpen: true,
  },
];

// GET all products
router.get("/products", (req, res) => {
  res.json(products);
});

// GET single product by ID
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

module.exports = router;

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get list of products
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of products
 */
