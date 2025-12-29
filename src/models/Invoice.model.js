import mongoose from "mongoose";
import applyBase from "./Base.model.js";

const invoceSchema = mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    date: { type: String, required: true },
    clientCompanyName: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientAddress: { type: String },
    clientGstNumber: { type: Number },
    items: { type: Array, required: true },
    subtotal: { type: Number, required: true },
    gstRate: { type: Number },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    includeGst: { type: Boolean },
    // Reference to TaxInvoice (optional linkage)
    taxInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaxInvoice",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // model name you want to populate from
      required: true, // true if every doc must have a bdm
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

applyBase(invoceSchema);
export default mongoose.model("Invoice", invoceSchema);
