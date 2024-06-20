import express from "express";
import morgan from "morgan";
import connectDB from "./config/mongoose.config.js";
import * as dotenv from "dotenv";
import productRouter from "./routes/product.routes.js";
import userRouter from "./routes/user.routes.js";
import musicRouter from "./routes/music.routes.js";
import reviewRouter from "./routes/review.routes.js";

dotenv.config();

const app = express();
const logger = morgan("dev");

app.use(express.json());
app.use(logger);

app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/music", musicRouter);
app.use("/reviews", reviewRouter);

app.listen(process.env.PORT, () => {
  console.clear();
  console.log("Server 🏃🏽 on port:", process.env.PORT);
  connectDB();
});
