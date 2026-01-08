import mongoose from "mongoose";
import applyBase from "./Base.model.js";

const bookingSchema = mongoose.Schema(
  {
    // user_id: { type: String, required: true },
    bdmName: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch_name: { type: String, required: true },
    company_name: { type: String },
    contact_person: { type: String, required: true },
    email: { type: String, required: true },
    contact_no: { type: Number, required: true },
    services: { type: [String], required: true },
    closed_by: { type: String },
    total_amount: { type: Number, required: true },
    term_1: { type: Number },
    term_2: { type: Number },
    term_3: { type: Number },
    payment_date: { type: String },
    pan: { type: String },
    gst: { type: String },
    remark: { type: String },
    // date: { type: Date, required: true },
    after_disbursement: { type: String },
    bank: { type: String },
    state: { type: String, required: true },
    status: { type: String },
    updatedhistory: [
      {
        updatedBy: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
        changes: {
          type: Map,
          of: new mongoose.Schema(
            {
              old: mongoose.Schema.Types.Mixed,
              new: mongoose.Schema.Types.Mixed,
            },
            { _id: false }
          ),
        },
      },
    ],
    // Trash/audit fields are provided by Base model
  },
  { versionKey: false, timestamps: true }
);
applyBase(bookingSchema);
export default mongoose.model("Booking", bookingSchema);
