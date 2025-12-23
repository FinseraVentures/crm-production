import mongoose from "mongoose";

const serviceSchema = mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
    category: { type: String, default: "" },
    processingTime: { type: String, default: "" },
    status: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default  mongoose.model("Service", serviceSchema);
