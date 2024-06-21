import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/", isAuth, isAdmin, async (req, res) => {
  try {
    const { name, description, price, quantity, image } = req.body;
    const productData = { name, description, price, quantity, image };

    for (const property in productData) {
      if (!productData[property]) {
        delete productData.property;
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.log("error creating product", error);
    res.status(500).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allProducts = await Product.find().populate({
      path: "reviews",
      populate: { path: "creator" },
    });
    console.log(allProducts[0]);
    res.json(allProducts);
  } catch (error) {
    console.log("error getting all products", error);
    res.status(500).json(error);
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate({
      path: "reviews",
      populate: { path: "creator" },
    });
    res.json(product);
  } catch (error) {
    console.log("error fetching details single product", error);
  }
});

router.put("/:productId", isAuth, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, quantity, image } = req.body;
    const productData = {
      name,
      description,
      price,
      quantity,
      image,
    };
    for (const property in productData) {
      if (!productData[property]) {
        delete productData.property;
      }
    }

    const updated = await Product.findByIdAndUpdate(productId, productData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "product was updated successfully", updated });
  } catch (error) {
    console.log("error editing the product", error);
    res.status(500).json(error);
  }
});

router.delete("/:productId", isAuth, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("reviews");

    for (const review of product.reviews) {
      await User.findByIdAndUpdate(review.creator, {
        $pull: { reviews: review._id },
      });
      await Review.findByIdAndDelete(review._id);
    }

    const deleted = await Product.findByIdAndDelete(productId);

    res.json({
      message: deleted.name + " product was deleted successfully",
      deleted,
    });
  } catch (error) {
    console.log("error deleting the product", error);
    res.status(500).json(error);
  }
});

export default router;
