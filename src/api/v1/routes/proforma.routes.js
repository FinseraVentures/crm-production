import express from "express";
import ProformaInvoice from "#models/ProformaInvoice.model.js";

const ProformaRoutes = express.Router();

// Create Proforma
ProformaRoutes.post("/create", async (req, res) => {
  try {
    const invoice = new ProformaInvoice({
      ...req.body,
      user: req.user._id, // ✅ enforce owner
    });
    const lastItem = await ProformaInvoice.findOne().sort({ createdAt: -1 }); // or {_id:-1}

    let nextNumber = 1;

    if (lastItem?.invoiceNumber) {
      const match = lastItem.invoiceNumber.match(/\d+/); // extracts number part
      const lastNumber = match ? parseInt(match[0], 10) : 0;

      nextNumber = lastNumber + 1;
    }

    // pad to 3 digits => INV001, INV002...
    invoice.invoiceNumber = `INV${String(nextNumber).padStart(3, "0")}`;

    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("Proforma create error:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Get all
ProformaRoutes.get("/view", async (req, res) => {
  try {
    const filter = {};
    const elevatedRoles = ["dev", "srdev"];

    if (!elevatedRoles.includes(req.user.user_role)) {
      filter.user = req.user._id;
    }

    const list = await ProformaInvoice.find(filter)
      .populate("user", "_id name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: list.length,
      list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get by id
ProformaRoutes.get("/:id", async (req, res) => {
  try {
    const isPrivileged = ["admin", "dev", "srdev", "hr"].includes(
      req.user.user_role,
    );

    const query = isPrivileged
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const invoice = await ProformaInvoice.findOne(query).populate("taxInvoice");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Proforma invoice not found or access denied",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("Proforma fetch error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Update
ProformaRoutes.put("/:id", async (req, res) => {
  try {
    const invoice = await ProformaInvoice.findOne({
      _id: req.params.id,
      user: req.user._id, // ✅ ownership enforced
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Proforma invoice not found or access denied",
      });
    }

    // ✅ Whitelist fields (VERY IMPORTANT)
    const {
      invoiceDate,
      clientDetails,
      items,
      includeGST,
      subtotal,
      gst,
      total,
    } = req.body;

    invoice.invoiceDate = invoiceDate;
    invoice.clientDetails = clientDetails;
    invoice.items = items;
    invoice.includeGST = includeGST;
    invoice.subtotal = subtotal;
    invoice.gst = gst;
    invoice.total = total;

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("Proforma update error:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete
ProformaRoutes.delete("/:id", async (req, res) => {
  try {
    const isPrivileged = ["admin", "dev", "srdev", "hr"].includes(
      req.user.user_role,
    );

    const query = isPrivileged
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const deleted = await ProformaInvoice.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Proforma invoice not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Proforma invoice deleted successfully",
    });
  } catch (err) {
    console.error("Proforma delete error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default ProformaRoutes;
