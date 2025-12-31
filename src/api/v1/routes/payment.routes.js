import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { appendToGoogleSheet } from "#utils/googleSheetLog.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";
import PaymentLink from "#models/Payment.model.js";
import PaymentQr from "#models/Qr.model.js";

dotenv.config();

const PaymentRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: UPI payment links, QR codes, and payment status APIs
 */

// INIT RAZORPAY

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @swagger
 * api/v1/payments/create-upi-link:
 *   post:
 *     summary: Create Razorpay UPI payment link
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - email
 *               - phone
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               email:
 *                 type: string
 *                 example: rahul@gmail.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               description:
 *                 type: string
 *                 example: GST Payment
 *               notifyEmail:
 *                 type: boolean
 *                 example: true
 *               notifySms:
 *                 type: boolean
 *                 example: true
 *               bdm:
 *                 type: string
 *                 example: BDM001
 *     responses:
 *       200:
 *         description: Payment link created successfully
 *       400:
 *         description: Required fields missing
 *       500:
 *         description: Razorpay error
 */

// 🟢 CREATE PAYMENT LINK + SAVE TO MONGO + SAVE LOG TO SHEET
PaymentRoutes.post("/create-upi-link", authenticateUser, async (req, res) => {
  const ownerUserId = req.user._id;
  try {
    const {
      amount,
      name,
      email,
      phone,
      description,
      notifyEmail = true,
      notifySms = true,
      userName,
    } = req.body;

    console.log(req.body);

    if (!amount || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Amount, email & phone are required." });
    }

    // Create Razorpay Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      accept_partial: false,
      description: description || "UPI Payment",
      customer: {
        name: name || "Customer",
        email,
        contact: phone,
      },
      notify: { sms: notifySms, email: notifyEmail },
      reminder_enable: true,
      notes: { purpose: "UPI Payment Link" },
      callback_url: "https://your-frontend-url.com/payment-status",
      callback_method: "get",
    });

    // Save to Google Sheet
    try {
      await appendToGoogleSheet({
        type: "LINK",
        timestamp: new Date().toISOString(),
        description, // or real company name field
        email,
        phone,
        bdm: userName,
        paymentLink: paymentLink.short_url,
        amount,
        status: "pending",
        name,
      });
    } catch (sheetErr) {
      console.error("Sheet logging failed:", sheetErr);
    }

    // Save in DB
    await PaymentLink.create({
      customerName: name,
      contact: phone,
      amount,
      user: ownerUserId,
      description,
      link: paymentLink.short_url,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      message: "Payment link created",
      payment_link_id: paymentLink.id,
      short_url: paymentLink.short_url,
    });
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    res.status(500).json({
      message:
        err.error?.description ||
        err.message ||
        "Payment link creation failed.",
    });
  }
});

/**
 * @swagger
 * api/v1/payments/api/payment-links:
 *   get:
 *     summary: Get all payment links
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payment links
 *       500:
 *         description: Server error
 */

// 🟠 GET ALL PAYMENT LINKS
PaymentRoutes.get("/payment-links", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.query; // optional filter

    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    const paymentLinks = await PaymentLink.find(filter)
      .populate("user", "_id name email") // 👈 creator info
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: paymentLinks.length,
      data: paymentLinks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * api/v1/payments/payment-links/{id}/status:
 *   patch:
 *     summary: Update payment link status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: paid
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Status missing
 *       404:
 *         description: Payment link not found
 *       500:
 *         description: Update failed
 */

// 🔵 UPDATE PAYMENT LINK STATUS (PATCH)
PaymentRoutes.patch(
  "/payment-links/:id/status",
  authenticateUser,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    try {
      //  Patch only the provided field
      const updated = await PaymentLink.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
      );

      //  If ID is invalid or no document found
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Payment link not found.",
        });
      }

      // Success response
      return res.status(200).json({
        success: true,
        message: "Payment link status updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("Status update error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update payment link status.",
        error: error.message,
      });
    }
  }
);

/**
 * @swagger
 * api/v1/payments/payment-links/{id}:
 *   get:
 *     summary: Get payment link by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment link fetched successfully
 *       404:
 *         description: Payment link not found
 *       400:
 *         description: Invalid ID
 */

// 🔴 GET PAYMENT LINK BY ID
PaymentRoutes.get("/payment-links/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const paymentLink = await PaymentLink.findById(id);

    if (!paymentLink) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: paymentLink });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
// 🟣 CREATE QR CODE + SAVE LOG

/**
 * @swagger
 * api/v1/payments/create-qr:
 *   post:
 *     summary: Create Razorpay UPI QR code
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - name
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2000
 *               name:
 *                 type: string
 *                 example: ABC Pvt Ltd
 *               description:
 *                 type: string
 *               bdm:
 *                 type: string
 *               usage:
 *                 type: string
 *                 example: single_use
 *               fixed_amount:
 *                 type: boolean
 *                 example: true
 *               close_by_hours:
 *                 type: number
 *                 example: 24
 *     responses:
 *       201:
 *         description: QR code created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: QR creation failed
 */
PaymentRoutes.post("/create-qr", authenticateUser, async (req, res) => {
  const ownerUserId = req.user._id;
  // console.log(ownerUserId);

  try {
    const {
      amount,
      name,
      description,
      customer_id,
      purpose,
      usage,
      fixed_amount,
      close_by_hours,
      userName,
    } = req.body;

    // console.log(req.body);

    if (!amount || !name) {
      return res
        .status(400)
        .json({ success: false, message: "amount and name are required" });
    }

    const closeBy =
      Math.floor(Date.now() / 1000) +
      (close_by_hours ? close_by_hours * 3600 : 24 * 3600);

    const qrData = {
      type: "upi_qr",
      name,
      usage: usage || "single_use",
      fixed_amount: fixed_amount ?? true,
      payment_amount: Math.round(amount * 100),
      description: description || "UPI QR Payment",
      close_by: closeBy,
      notes: { purpose: purpose || "UPI QR Payment" },
    };

    if (customer_id) qrData.customer_id = customer_id;

    // create QR with Razorpay
    const qr = await razorpay.qrCode.create(qrData);

    // fetch image and convert to base64 (if environment supports fetch)
    let base64QR = null;
    try {
      const imageRes = await fetch(qr.image_url);
      const buffer = await imageRes.arrayBuffer();
      base64QR = Buffer.from(buffer).toString("base64");
    } catch (imgErr) {
      console.error("Failed to fetch/convert QR image:", imgErr);
      // continue — base64 may not be critical
    }

    // Google Sheet logging (best-effort)
    (async () => {
      try {
        await appendToGoogleSheet({
          type: "QR",
          name,
          bdm: userName,
          amount,
          description,
          qr_id: qr.id,
          qr_image: qr.image_url,
          usage,
          purpose,
          fixed_amount,
          close_by: closeBy,
          status: "Pending",
        });
      } catch (sheetErr) {
        console.error("Sheet logging failed:", sheetErr);
      }
    })();

    // Save to MongoDB
    let savedQR = null;
    try {
      savedQR = await PaymentQr.create({
        name,
        user: ownerUserId,
        amount,
        description,
        qr_id: qr.id,
        qr_image: qr.image_url,
        usage: usage || "single_use",
        purpose: purpose || "UPI QR Payment",
        fixed_amount: fixed_amount ?? true,
        close_by: closeBy,
        qr_base64: base64QR ? `data:image/png;base64,${base64QR}` : null,
        status: "Pending",
      });
    } catch (dbErr) {
      console.error("Failed to save QR to DB:", dbErr);
      // proceed — return Razorpay response even if DB save failed
    }

    return res.status(201).json({
      success: true,
      message: "QR Code created",
      qr_id: qr.id,
      qr_data: qr,
      qr_base64: base64QR ? `data:image/png;base64,${base64QR}` : null,
      savedRecord: savedQR, // may be null if DB save failed
    });
  } catch (err) {
    console.error("QR create error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "QR creation failed" });
  }
});
//Get all Qr codes
PaymentRoutes.get("/qr-codes", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.query; // optional filter

    const filter = {};
    if (userId) {
      filter.user = userId;
    }

    const qrCodes = await PaymentQr.find(filter)
      .populate("user", "_id name email") // 👈 creator info
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes,
    });
  } catch (error) {
    console.error("Get Payment QR Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment QR codes",
    });
  }
});
export default PaymentRoutes;
