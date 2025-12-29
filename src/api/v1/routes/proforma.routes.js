import express from "express";
import ProformaInvoice from "#models/ProformaInvoice.model.js";

const ProformaRoutes = express.Router();

// Create Proforma
ProformaRoutes.post("/create", async (req, res) => {
  console.log(req.body)
  try {
    const p = new ProformaInvoice(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all
ProformaRoutes.get("/view", async (req, res) => {
  try {
    const list = await ProformaInvoice.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by id
ProformaRoutes.get("/:id", async (req, res) => {
  try {
    const p = await ProformaInvoice.findById(req.params.id).populate("taxInvoice");
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
