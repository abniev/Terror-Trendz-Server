import express from "express";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "please provide email,username,and password" });
    }

    const foundUser = User.findOne({ $or: [{ email }, { username }] });
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

    const paswordRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 8 characters and contain at least one Number, one lowercase, one uppercase letter and a special character.",
      });
      return;
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

export default router;
