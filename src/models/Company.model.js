import mongoose from "mongoose";
import applyBase from "./base.schema.js";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  plan: { type: String, default: "free" },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

applyBase(companySchema);
export default mongoose.model("Company", companySchema);
