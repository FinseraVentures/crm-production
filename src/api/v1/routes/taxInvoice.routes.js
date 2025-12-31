import express from "express";
import TaxInvoice from "#models/TaxInvoice.model.js";

const TaxInvoiceRoutes = express.Router();

// Create TaxInvoice
TaxInvoiceRoutes.post("/create", async (req, res) => {
  // console.log(req.body)
  try {
    const inv = new TaxInvoice(req.body);
    await inv.save();
    res.status(201).json(inv);
    // console.log(res ,"sss")
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all
TaxInvoiceRoutes.get("/view", async (req, res) => {
  try {
    const list = await TaxInvoice.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by id
TaxInvoiceRoutes.get("/:id", async (req, res) => {
  try {
    const inv = await TaxInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ error: "TaxInvoice not found" });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
TaxInvoiceRoutes.put("/:id", async (req, res) => {
  try {
    const inv = await TaxInvoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!inv) return res.status(404).json({ error: "TaxInvoice not found" });
    res.json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
TaxInvoiceRoutes.delete("/:id", async (req, res) => {
  try {
    const inv = await TaxInvoice.findByIdAndDelete(req.params.id);
    if (!inv) return res.status(404).json({ error: "TaxInvoice not found" });
    res.json({ message: "TaxInvoice deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default TaxInvoiceRoutes;
