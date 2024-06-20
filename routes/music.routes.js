import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Music from "../models/music.model.js";

const router = express.Router();

router.post("/:musicId", isAuth, isAdmin, async (req, res) => {
  try {
    const { videoUrl, artist, name } = req.body;
    const musicData = {
      videoUrl,
      artist,
      name,
    };
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
  }
});

router.get("/:musicId", async (req, res) => {
  try {
    const { musicId } = req.params;
    const music = await Music.findById(musicId).populate({
      path: "review",
      populate: { path: "creator" },
    });
    res.json(music);
  } catch (error) {
    console.log("error getting a single song", music);
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
      await review.findByIdAndDelete(review._id);
    }
    const deleted = await Music.findByIdAndDelete(musicId);

    res.json({
      message: deleted.name + "music was deleted sucessfully",
      deleted,
    });
  } catch (error) {
    console.log("error deleting the song", error);
    res.status(500).json(error);
  }
});

export default router;
