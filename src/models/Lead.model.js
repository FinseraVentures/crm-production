import mongoose from "mongoose";

const leadSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    company_name: { type: String },
    contact_person: { type: String },
    email: { type: String },
    contact_no: { type: String },
    services: { type: Array, default: [] },

  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Lead", leadSchema);
