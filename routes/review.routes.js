import express from "express";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import isAuth from "../middleware/authentication.middleware.js";

const router = express.Router();

router.post("/:productId", isAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, review, rating } = req.body;

    const createdReview = await Review.create({
      title,
      review,
      rating,
      creator: req.user._id,
      product: productId,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );

    await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );
    res
      .status(201)
      .json({ message: "review created successfully", createdReview });
  } catch (error) {
    console.log("error while creating a review", error);
    res.status(500).json(error);
  }
});

router.delete("/:reviewId", isAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (review.creator.toString() !== req.user._id) {
      return res.status(401).json({ message: "You can't delete this review" });
    }
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });
    await User.findByIdAndUpdate(review.creator, {
      $pull: { reviews: review._id },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Your review was deleted successfully" });
  } catch (error) {
    console.log("error while deleting review", error);
    res.status(500).json(error);
  }
});

export default router;
