import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      maxLength: 34,
      minLength: 4,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      maxLength: 42,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profilePic: {
      type: String,
      default:
        "https://www.pngrepo.com/png/384670/512/account-avatar-profile-user.png",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamp: true,
  }
);

export default model("User", userSchema);
