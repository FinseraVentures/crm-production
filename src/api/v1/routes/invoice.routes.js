// import express from "express";
// import  Invoice from "#models/Invoice.model.js";

// const InvoiceRoutes = express.Router();
// /**
//  * @swagger
//  * api/v1/invoices:
//  *   post:
//  *     summary: Create a new invoice
//  *     tags: [Invoices]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - invoiceNumber
//  *               - date
//  *               - clientCompanyName
//  *               - clientName
//  *               - clientEmail
//  *               - items
//  *               - subtotal
//  *               - gstAmount
//  *               - total
//  *             properties:
//  *               invoiceNumber:
//  *                 type: string
//  *                 example: "INV-2025-001"
//  *               date:
//  *                 type: string
//  *                 example: "2025-01-15"
//  *               clientCompanyName:
//  *                 type: string
//  *                 example: "ABC Pvt Ltd"
//  *               clientName:
//  *                 type: string
//  *                 example: "Rohit Sharma"
//  *               clientEmail:
//  *                 type: string
//  *                 example: "accounts@abc.com"
//  *               clientAddress:
//  *                 type: string
//  *                 example: "Noida, Uttar Pradesh"
//  *               clientGstNumber:
//  *                 type: number
//  *                 example: 27ABCDE1234F1Z5
//  *               items:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     name:
//  *                       type: string
//  *                       example: "GST Registration"
//  *                     quantity:
//  *                       type: number
//  *                       example: 1
//  *                     price:
//  *                       type: number
//  *                       example: 10000
//  *                     total:
//  *                       type: number
//  *                       example: 10000
//  *               subtotal:
//  *                 type: number
//  *                 example: 10000
//  *               gstRate:
//  *                 type: number
//  *                 example: 18
//  *               gstAmount:
//  *                 type: number
//  *                 example: 1800
//  *               total:
//  *                 type: number
//  *                 example: 11800
//  *               includeGst:
//  *                 type: boolean
//  *                 example: true
//  *     responses:
//  *       201:
//  *         description: Invoice created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Invoice"
//  *       400:
//  *         description: Validation error
//  *       401:
//  *         description: Unauthorized
//  *       500:
//  *         description: Server error
//  */

// // Create Invoice
// InvoiceRoutes.post("/", async (req, res) => {
//   // console.log(req.body);
//   try {
//     const invoice = new Invoice(req.body);
//     await invoice.save();
//     res.status(201).json(invoice);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// /**
//  * @swagger
//  * api/v1/invoices:
//  *   get:
//  *     summary: Get all invoices
//  *     tags: [Invoices]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of invoices
//  *       500:
//  *         description: Server error
//  */

// // Get all invoices
// InvoiceRoutes.get("/", async (req, res) => {
//   try {
//     const invoices = await Invoice.find();
//     res.json(invoices);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * @swagger
//  * api/v1/invoices/{id}:
//  *   get:
//  *     summary: Get invoice by ID
//  *     tags: [Invoices]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Invoice fetched successfully
//  *       404:
//  *         description: Invoice not found
//  *       500:
//  *         description: Server error
//  */

// // Get invoice by ID
// InvoiceRoutes.get("/:id", async (req, res) => {
//   try {
//     const invoice = await Invoice.findById(req.params.id);
//     if (!invoice) return res.status(404).json({ error: "Invoice not found" });
//     res.json(invoice);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * @swagger
//  * api/v1/invoices/{id}:
//  *   put:
//  *     summary: Update an invoice by ID
//  *     tags: [Invoices]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Invoice ID
//  *         schema:
//  *           type: string
//  *           example: "64f1b9c9e8a123456789abcd"
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               invoiceNumber:
//  *                 type: string
//  *                 example: "INV-2025-002"
//  *               date:
//  *                 type: string
//  *                 example: "2025-01-20"
//  *               clientCompanyName:
//  *                 type: string
//  *                 example: "XYZ Pvt Ltd"
//  *               clientName:
//  *                 type: string
//  *                 example: "Amit Verma"
//  *               clientEmail:
//  *                 type: string
//  *                 example: "finance@xyz.com"
//  *               clientAddress:
//  *                 type: string
//  *                 example: "Bangalore, Karnataka"
//  *               clientGstNumber:
//  *                 type: number
//  *                 example: 29ABCDE1234F1Z9
//  *               items:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     name:
//  *                       type: string
//  *                       example: "MSME Registration"
//  *                     quantity:
//  *                       type: number
//  *                       example: 2
//  *                     price:
//  *                       type: number
//  *                       example: 5000
//  *                     total:
//  *                       type: number
//  *                       example: 10000
//  *               subtotal:
//  *                 type: number
//  *                 example: 10000
//  *               gstRate:
//  *                 type: number
//  *                 example: 18
//  *               gstAmount:
//  *                 type: number
//  *                 example: 1800
//  *               total:
//  *                 type: number
//  *                 example: 11800
//  *               includeGst:
//  *                 type: boolean
//  *                 example: true
//  *     responses:
//  *       200:
//  *         description: Invoice updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/Invoice"
//  *       400:
//  *         description: Validation error
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Invoice not found
//  *       500:
//  *         description: Server error
//  */

// // Update invoice
// InvoiceRoutes.put("/:id", async (req, res) => {
//   try {
//     const invoice = await Invoice.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!invoice) return res.status(404).json({ error: "Invoice not found" });
//     res.json(invoice);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// /**
//  * @swagger
//  * api/v1/invoices/{id}:
//  *   delete:
//  *     summary: Delete an invoice
//  *     tags: [Invoices]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Invoice deleted successfully
//  *       404:
//  *         description: Invoice not found
//  *       500:
//  *         description: Server error
//  */

// // Delete invoice
// InvoiceRoutes.delete("/:id", async (req, res) => {
//   try {
//     const invoice = await Invoice.findByIdAndDelete(req.params.id);
//     if (!invoice) return res.status(404).json({ error: "Invoice not found" });
//     res.json({ message: "Invoice deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default InvoiceRoutes;
