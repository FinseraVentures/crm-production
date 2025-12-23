import mongoose from "mongoose";

const paymentLinkSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // model name you want to populate from
      required: true, // true if every doc must have a bdm
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    link: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "expired", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("PaymentLink", paymentLinkSchema);
