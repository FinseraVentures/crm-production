import express from "express";
import TaxInvoice from "#models/TaxInvoice.model.js";

const TaxInvoiceRoutes = express.Router();
const PRIVILEGED_ROLES = ["admin", "dev", "srdev", "hr"];

TaxInvoiceRoutes.post("/create", async (req, res) => {
  try {
    // Whitelist allowed fields only
    const {
      invoiceNumber,
      invoiceDate,
      clientDetails,
      items,
      subtotal,
      gst,
      total,
      proformaInvoice, // relation if any
    } = req.body;

    const invoice = new TaxInvoice({
      invoiceNumber,
      invoiceDate,
      clientDetails,
      items,
      subtotal,
      gst,
      total,
      proformaInvoice,
      user: req.user._id, // ✅ enforce ownership
      createdByRole: req.user.user_role, // optional but useful
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("TaxInvoice create error:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

TaxInvoiceRoutes.get("/view", async (req, res) => {
  try {
    const isPrivileged = PRIVILEGED_ROLES.includes(req.user.user_role);

    const query = isPrivileged ? {} : { user: req.user._id };

    const invoices = await TaxInvoice.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invoices,
    });
  } catch (err) {
    console.error("TaxInvoice list error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get by id
TaxInvoiceRoutes.get("/:id", async (req, res) => {
  try {
    const isPrivileged = PRIVILEGED_ROLES.includes(req.user.user_role);

    const query = isPrivileged
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const invoice = await TaxInvoice.findOne(query);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Tax invoice not found or access denied",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("TaxInvoice fetch error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Update
TaxInvoiceRoutes.put("/:id", async (req, res) => {
  try {
    const isPrivileged = PRIVILEGED_ROLES.includes(req.user.user_role);

    const query = isPrivileged
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const invoice = await TaxInvoice.findOne(query);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Tax invoice not found or access denied",
      });
    }

    // 🔒 Whitelist fields
    const { invoiceDate, clientDetails, items, subtotal, gst, total, status } =
      req.body;

    invoice.invoiceDate = invoiceDate;
    invoice.clientDetails = clientDetails;
    invoice.items = items;
    invoice.subtotal = subtotal;
    invoice.gst = gst;
    invoice.total = total;
    invoice.status = status;

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("TaxInvoice update error:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete
TaxInvoiceRoutes.delete("/:id", async (req, res) => {
  try {
    const isPrivileged = PRIVILEGED_ROLES.includes(req.user.user_role);

    const query = isPrivileged
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const deleted = await TaxInvoice.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Tax invoice not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Tax invoice deleted successfully",
    });
  } catch (err) {
    console.error("TaxInvoice delete error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default TaxInvoiceRoutes;
