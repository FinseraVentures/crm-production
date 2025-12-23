import express from "express";
import  Email from "#models/Email.model.js";

const EmailRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Emails
 *   description: Lead / email enquiry management APIs
 */

/**
 * @swagger
 * /email/add:
 *   post:
 *     summary: Create a new email enquiry
 *     tags: [Emails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               companyName:
 *                 type: string
 *                 example: ABC Pvt Ltd
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               location:
 *                 type: string
 *                 example: Delhi
 *               service:
 *                 type: string
 *                 example: GST Registration
 *               message:
 *                 type: string
 *                 example: Need help with GST
 *     responses:
 *       201:
 *         description: Email entry created successfully
 *       400:
 *         description: Required fields missing
 *       409:
 *         description: Entry already exists
 *       500:
 *         description: Internal server error
 */

// Create a new email entry
EmailRoutes.post("/add", async (req, res) => {
  const { name, companyName, phoneNumber, email, location, service, message } =
    req.body;

  if (!name || !phoneNumber || !email) {
    return res
      .status(400)
      .send({ message: "name, phoneNumber and email are required" });
  }

  try {
    const existing = await Email.findOne({ email, phoneNumber });
    if (existing) {
      return res
        .status(409)
        .send({ message: "Entry with same email and phone already exists" });
    }

    const created = await Email.create({
      name,
      companyName,
      phoneNumber,
      email,
      location,
      service,
      message,
    });
    return res
      .status(201)
      .send({ message: "Email entry created", id: created._id, created });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * /email/all:
 *   get:
 *     summary: Get all email enquiries
 *     tags: [Emails]
 *     responses:
 *       200:
 *         description: List of email entries
 *       500:
 *         description: Internal server error
 */

// Get all email entries
EmailRoutes.get("/all", async (req, res) => {
  try {
    const all = await Email.find().sort({ createdAt: -1 });
    return res.status(200).send(all);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * /email/{id}:
 *   get:
 *     summary: Get single email enquiry by ID
 *     tags: [Emails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email entry fetched successfully
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Internal server error
 */

// Get single email entry by id
EmailRoutes.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await Email.findById(id);
    if (!entry) return res.status(404).send({ message: "Not found" });
    return res.status(200).send(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * /email/{id}:
 *   patch:
 *     summary: Update email enquiry by ID
 *     tags: [Emails]
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
 *     responses:
 *       200:
 *         description: Email entry updated successfully
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Internal server error
 */

// Update email entry by id
EmailRoutes.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Email.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!updated) return res.status(404).send({ message: "Not found" });
    return res.status(200).send({ message: "Updated successfully", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * /email/{id}:
 *   delete:
 *     summary: Permanently delete email enquiry
 *     tags: [Emails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-role
 *         required: true
 *         schema:
 *           type: string
 *         description: Must be srdev
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *       403:
 *         description: Only srdev can delete entries
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Internal server error
 */

// Delete email entry by id (permanent)
EmailRoutes.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers["user-role"]; // require srdev to delete

  if (userRole !== "srdev") {
    return res
      .status(403)
      .send({ message: "Only srdev can permanently delete entries." });
  }

  try {
    const existing = await Email.findById(id);
    if (!existing) return res.status(404).send({ message: "Not found" });

    await Email.findByIdAndDelete(id);
    return res.status(200).send({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

export default EmailRoutes;
