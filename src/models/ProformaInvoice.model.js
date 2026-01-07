import mongoose from "mongoose";
import applyBase from "./Base.model.js";

/* =========================
   ITEM SCHEMA
========================= */
const ProformaItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
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
    gstPan: { type: String },

    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    postcode: { type: String },
  },
  { _id: false }
);

/* =========================
   PROFORMA INVOICE
========================= */
const ProformaInvoiceSchema = new mongoose.Schema(
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
      type: [ProformaItemSchema],
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

    // Optional linkage
    taxInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaxInvoice",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applyBase(ProformaInvoiceSchema);

export default mongoose.model("ProformaInvoice", ProformaInvoiceSchema);
