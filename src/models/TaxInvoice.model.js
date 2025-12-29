import mongoose from "mongoose";
import applyBase from "./Base.model.js";

/* =========================
   ITEM SCHEMA
========================= */
const ItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },

    // Optional per-item tax (future ready)
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

/* =========================
   CLIENT DETAILS
========================= */
const ClientDetailsSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String },
    contactNumber: { type: String },
    email: { type: String },

    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    postcode: { type: String },
    gstPan: { type: String },
  },
  { _id: false }
);

/* =========================
   TAX INVOICE
========================= */
const TaxInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
    },

    clientDetails: {
      type: ClientDetailsSchema,
      required: true,
    },

    items: {
      type: [ItemSchema],
      default: [],
    },

    includeGST: {
      type: Boolean,
      default: true,
    },

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      default: 0,
    },

    // References
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applyBase(TaxInvoiceSchema);

export default mongoose.model("TaxInvoice", TaxInvoiceSchema);
