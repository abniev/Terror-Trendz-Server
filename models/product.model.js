import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 100,
    },
    price: { type: String, required: true },
    quantity: { type: Number, required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    image: {
      type: String,
      default:
        "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png",
    },
  },
  {
    timestamps: true,
  }
);
export default model("Product", productSchema);
