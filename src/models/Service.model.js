import mongoose from "mongoose";
import applyBase from "./Base.model.js";
const serviceSchema = mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true },
    category: { type: String, default: "" },
    serviceType: { type: String, default: "" },
    processingTime: { type: String, default: "" },
    status: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

applyBase(serviceSchema);
export default mongoose.model("Service", serviceSchema);
