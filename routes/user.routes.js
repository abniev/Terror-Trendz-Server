import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "please provide email,username,and password" });
    }

    const foundUser = await User.findOne({ $or: [{ email }, { username }] });
    if (foundUser) {
      return res
        .status(400)
        .json({ message: "The email or username was already taken" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address." });
      return;
    }

    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 8 characters and contain at least one Number, one lowercase, one uppercase letter and a special character.",
      });
      return;
    }
    const salts = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salts);

    const createdUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User was created Succesfully", createdUser });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }

  router.post("/login", async (req, res) => {
    try {
      const { email, username, password } = req.body;
      if (!(email || username) || !password) {
        return res
          .status(400)
          .json({ message: "Please provide email or username, and password" });
      }
      const user = await User.findOne({ $or: [{ email }, { username }] });
      if (!user) {
        return res.status(401).json({ message: "User does not exist" });
      }
      const passwordCheck = await bcrypt.compare(password, user.password);

      if (!passwordCheck) {
        return res
          .status(401)
          .json({ message: "Email/Username or password incorrect" });
      }
      delete user._doc.password;
      const jwtToken = jwt.sign(
        { payload: user },
        process.env.TOKEN_SIGN_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "24h",
        }
      );

      res.json({ user, authToken: jwtToken });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  });

  router.get("/verify", isAuth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.json({ message: "User is logged in", user });
    } catch (error) {
      console.log("error in verify", error);
      res.status(500).json(error);
    }
  });

  router.get("/admin", isAuth, isAdmin, async (req, res) => {
    try {
      res.json({ message: "Admin is logged in and verified", user: req.user });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  });
});

export default router;
