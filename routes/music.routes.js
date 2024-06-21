import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Music from "../models/music.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/", isAuth, isAdmin, async (req, res) => {
  try {
    const { videoUrl, artist, title } = req.body;
    const musicData = { videoUrl, artist, title };

    for (const property in musicData) {
      if (!musicData[property]) {
        delete musicData.property;
      }
    }

    const music = await Music.create(musicData);

    res.status(201).json({ message: "Music added successfully", music });
  } catch (error) {
    console.log("error while posting a song", error);
    res.status(500).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allMusic = await Music.find().populate({
      path: "reviews",
      populate: { path: "creator" },
    });
    console.log(allMusic[0]);
    res.json(allMusic);
  } catch (error) {
    console.log("error getting all music", error);
    res.status(500).json(error);
  }
});

router.get("/:musicId", async (req, res) => {
  try {
    const { musicId } = req.params;
    const music = await Music.findById(musicId).populate({
      path: "reviews",
      populate: { path: "creator" },
    });
    res.json(music);
  } catch (error) {
    console.log("error getting a single song", error);
  }
});

router.put("/:musicId", isAuth, isAdmin, async (req, res) => {
  try {
    const { musicId } = req.params;
    const { videoUrl, artist, title } = req.body;
    const musicData = {
      videoUrl,
      artist,
      title,
    };
    for (const property in musicData) {
      if (!musicData[property]) {
        delete musicData.property;
      }
    }
    const updated = await Music.findByIdAndUpdate(musicId, musicData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "music was updated successfully", updated });
  } catch (error) {
    console.log("error editing the music", error);
    res.status(500).json(error);
  }
});

router.delete("/:musicId", isAuth, isAdmin, async (req, res) => {
  try {
    const { musicId } = req.params;
    const music = await Music.findById(musicId).populate("reviews");

    for (const review of music.reviews) {
      await User.findByIdAndUpdate(review.creator, {
        $pull: { reviews: review._id },
      });
      await Review.findByIdAndDelete(review._id);
    }
    const deleted = await Music.findByIdAndDelete(musicId);

    res.json({
      message: deleted.title + "music was deleted sucessfully",
      deleted,
    });
  } catch (error) {
    console.log("error deleting the song", error);
    res.status(500).json(error);
  }
});

export default router;
