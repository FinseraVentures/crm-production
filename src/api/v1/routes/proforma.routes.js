import express from "express";
import ProformaInvoice from "#models/ProformaInvoice.model.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";

const ProformaRoutes = express.Router();

// Create Proforma
ProformaRoutes.post("/create", async (req, res) => {
  try {
    const p = new ProformaInvoice(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all
ProformaRoutes.get("/view", authenticateUser, async (req, res) => {
  try {
    const filter = {};
    const elevatedRoles = ["hr", "dev", "srdev"];

    if (!elevatedRoles.includes(req.user.user_role)) {
      filter.user = req.user._id;
    } else {
      filter.user = { $ne: null };
    }

    // ⛑️ HARD SAFETY: ignore broken user refs
    filter.user = { $ne: null };

    const list = await ProformaInvoice.find(filter)
      .populate("user", "_id name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: list.length,
      data: list,
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
    const p = await ProformaInvoice.findById(req.params.id).populate(
      "taxInvoice"
    );
    if (!p) return res.status(404).json({ error: "ProformaInvoice not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
ProformaRoutes.put("/:id", async (req, res) => {
  try {
    const p = await ProformaInvoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!p) return res.status(404).json({ error: "ProformaInvoice not found" });
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
ProformaRoutes.delete("/:id", async (req, res) => {
  try {
    const p = await ProformaInvoice.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: "ProformaInvoice not found" });
    res.json({ message: "ProformaInvoice deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default ProformaRoutes;
