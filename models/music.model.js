import { Schema, model } from "mongoose";

const musicSchema = new Schema(
  {
    videoUrl: { type: String, required: true },
    artist: { type: String, required: true, trim: true, minLength: 1 },
    title: { type: String, required: true, trim: true, minLength: 1 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);
export default model("Music", musicSchema);
