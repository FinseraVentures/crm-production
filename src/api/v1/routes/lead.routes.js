import express from "express";
import  Email  from "#models/Email.model.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";

const LeadRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead management APIs
 */

/**
 * @swagger
 * api/v1/leads/all:
 *   get:
 *     summary: Get all unassigned leads
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: List of unassigned leads
 *       500:
 *         description: Server error
 */

// Get all unassigned leads (SCALED)
LeadRoutes.get("/all", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const leads = await Email.find(
      {
        assignedTo: "unassigned",
        isDeleted: false,
      },
      {
        name: 1,
        companyName: 1,
        phoneNumber: 1,
        email: 1,
        location: 1,
        service: 1,
        createdAt: 1,
        assignedTo: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).send({
      page,
      limit,
      count: leads.length,
      leads,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/leads/edit/{id}:
 *   patch:
 *     summary: Update a lead by ID
 *     tags: [Leads]
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
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Server error
 */

// Edit lead by id
LeadRoutes.patch("/edit/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const existing = await Email.findById(id);
    if (!existing || existing.isDeleted)
      return res.status(404).send({ message: "Lead not found" });

    const updated = await Email.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return res.status(200).send({ message: "Lead updated", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/leads/trash/{id}:
 *   patch:
 *     summary: Move lead to trash (soft delete)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: user-name
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead moved to trash
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Server error
 */

// Soft-delete (move to trash) lead by id
LeadRoutes.patch("/trash/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const deletedBy = req.headers["user-name"] || "Unknown";

  try {
    const existing = await Email.findById(id);
    if (!existing || existing.isDeleted)
      return res.status(404).send({ message: "Lead not found" });

    existing.isDeleted = true;
    existing.deletedAt = new Date();
    existing.deletedBy = deletedBy;
    await existing.save();

    return res
      .status(200)
      .send({ message: "Lead moved to trash", lead: existing });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/leads/delete/{id}:
 *   delete:
 *     summary: Permanently delete a lead (srdev only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
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
 *         description: Lead permanently deleted
 *       403:
 *         description: Only srdev can delete leads
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Server error
 */

// Permanent delete - only srdev
LeadRoutes.delete("/delete/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers["user-role"];

  if (userRole !== "srdev") {
    return res
      .status(403)
      .send({ message: "Only srdev can permanently delete leads." });
  }

  try {
    const existing = await Email.findById(id);
    if (!existing) return res.status(404).send({ message: "Lead not found" });

    await Email.findByIdAndDelete(id);
    return res.status(200).send({ message: "Lead permanently deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

export default LeadRoutes;
