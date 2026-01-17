import mongoose from "mongoose";

const leadSchema = mongoose.Schema(
  // lead.schema.ts or lead.model.js
  {
    name: String,
    email: String,
    phone: String,

    status: {
      type: String,
      enum: ["new", "contacted", "followup", "won", "lost"],
      default: "new",
    },

    tags: [String],
    customFields: Object,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // model name you want to populate from
      required: true,
    }, // true if every doc must have a bdm,
    isCustomer: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Lead", leadSchema);
