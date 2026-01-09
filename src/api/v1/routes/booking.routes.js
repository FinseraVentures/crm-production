import express from "express";
import Booking from "#models/Booking.model.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";
import { normalizeDateOnly } from "#utils/date.js";

const BookingRoutes = express.Router();

/**
 * @swagger
 * /api/v1/booking/addbooking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - bdm
 *               - branch_name
 *               - contact_person
 *               - email
 *               - services
 *               - total_amount
 *               - pan
 *               - state
 *               - date
 *             properties:
 *               user_id:
 *                 type: string
 *               bdm:
 *                 type: string
 *               branch_name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               email:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               total_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
//Addbooking
BookingRoutes.post("/addbooking", authenticateUser, async (req, res) => {
  const ownerUserId = req.user._id;
  const {
    branch_name,
    company_name,
    contact_person,
    email,
    contact_no,
    services,
    total_amount,
    term_1,
    term_2,
    term_3,
    payment_date,
    closed_by,
    pan,
    gst,
    remark,
    date,
    status,
    bank,
    after_disbursement,
    state,
  } = req.body;

  const requiredFields = {
    branch_name,
    contact_person,
    email,
    services,
    total_amount,
    pan,
    state,
    // date,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(
      ([key, value]) =>
        !value ||
        (key === "services" && (!Array.isArray(value) || value.length === 0))
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).send({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const new_booking = {
      user: ownerUserId,
      bdmName: req.user.name,
      branch_name,
      company_name: company_name || "",
      contact_person,
      email,
      contact_no,
      closed_by,
      services,
      total_amount,
      term_1,
      term_2,
      term_3,
      payment_date: payment_date,
      pan,
      gst: gst || "N/A",
      remark,
      status,
      bank,
      state,
      after_disbursement,
    };

    const booking = await Booking.create(new_booking);
    return res.status(201).send({
      Message: "Booking Created Successfully",
      booking_id: booking._id,
      booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * api/v1/booking/editbooking/{id}:
 *   patch:
 *     summary: Edit an existing booking
 *     tags: [Bookings]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

//Edit booking
BookingRoutes.patch("/editbooking/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  let updates = req.body;
  if (updates.payment_date) {
    updates.payment_date = normalizeDateOnly(updates.payment_date);
  }

  const user_role = req.headers["user-role"] || req.user.user_role;
  if (!user_role) {
    return res.status(400).send({ message: "User role is required" });
  }

  const { updatedBy, note } = updates;
  delete updates.updatedBy;
  delete updates.note;

  try {
    const oldBooking = await Booking.findById(id);

    if (!oldBooking) {
      return res.status(404).send("Booking not found");
    }

    const rolesWithFullAccess = ["dev", "senior admin", "srdev", "hr"];

    if (user_role === "admin") {
      const { services, ...allowedUpdates } = updates;
      updates = allowedUpdates;
    }

    // Detect changed fields
    const changedFields = {};
    for (let key in updates) {
      const oldValue = oldBooking[key];
      const newValue = updates[key];

      // Deep compare for arrays or primitive values
      if (Array.isArray(oldValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changedFields[key] = { old: oldValue, new: newValue };
        }
      } else if (oldValue !== newValue) {
        changedFields[key] = { old: oldValue, new: newValue };
      }
    }

    // If nothing changed, exit early
    if (Object.keys(changedFields).length === 0) {
      return res.status(400).send({ message: "No changes detected" });
    }

    // Create updated history entry
    const historyEntry = {
      updatedBy: updatedBy || "Unknown",
      updatedAt: new Date(),
      note: note || "",
      changes: changedFields,
    };

    if (rolesWithFullAccess.includes(user_role) || user_role === "admin") {
      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        {
          $set: updates,
          $push: { updatedhistory: historyEntry },
        },
        { new: true }
      );

      return res.status(200).send({
        message: "Booking Updated Successfully",
        updatedBooking,
      });
    }

    return res.status(403).send({
      message: "You do not have permission to edit this booking",
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/trash/{id}:
 *   patch:
 *     summary: Move booking to trash (soft delete)
 *     tags: [Bookings]
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
 *     responses:
 *       200:
 *         description: Booking moved to trash
 *       403:
 *         description: Only dev or srdev allowed
 */

//trash
BookingRoutes.patch("/trash/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.user_role;
  const deletedBy = req.user.name;
  if (!userRole || !["srdev", "dev", "senior admin"].includes(userRole)) {
    return res.status(403).send({
      message: "Only dev or srdev  , senior admin can move bookings to trash.",
    });
  }

  try {
    const trashedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user._id,
      },
      { new: true }
    );

    if (!trashedBooking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    res.status(200).send({ message: "Booking moved to trash", trashedBooking });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// to fetch from the trash
BookingRoutes.get("/trash", authenticateUser, async (req, res) => {
  // const userRole = req.headers["user-role"];
  const userRole = req.user.user_role;

  if (!userRole || userRole !== "srdev") {
    return res.status(403).send({ message: "Only srdev can view trash." });
  }

  try {
    const trashedBookings = await Booking.find({ isDeleted: true }).sort({
      deletedAt: -1,
    });
    res.status(200).send(trashedBookings);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/restore/{id}:
 *   patch:
 *     summary: Restore a trashed booking
 *     tags: [Bookings]
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
 *         description: Booking restored successfully
 *       403:
 *         description: Only srdev allowed
 */

// to restore
BookingRoutes.patch("/restore/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  // const userRole = req.headers["user-role"];
  const userRole = req.user.user_role;

  if (!userRole || userRole !== "srdev") {
    return res
      .status(403)
      .send({ message: "Only srdev can restore trashed bookings." });
  }

  try {
    const restoredBooking = await Booking.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!restoredBooking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    res
      .status(200)
      .send({ message: "Booking restored successfully", restoredBooking });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/deletebooking/{id}:
 *   delete:
 *     summary: Permanently delete a booking
 *     tags: [Bookings]
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
 *         description: Booking permanently deleted
 *       400:
 *         description: Booking must be trashed first
 *       403:
 *         description: Only srdev allowed
 */

//Delete Booking
BookingRoutes.delete(
  "/deletebooking/:id",
  authenticateUser,
  async (req, res) => {
    const { id } = req.params;
    // const userRole = req.headers["user-role"];
    const userRole = req.user.user_role;

    if (userRole !== "srdev") {
      return res
        .status(403)
        .send({ message: "Only srdev can permanently delete bookings." });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    if (!booking.isDeleted) {
      return res.status(400).send({
        message: "You must move this booking to trash before deleting.",
      });
    }

    try {
      await Booking.findByIdAndDelete(id);
      return res.status(200).send({ message: "Booking permanently deleted." });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  }
);

/**
 * @swagger
 * api/v1/booking/getbooking/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Booking fetched successfully
 *       404:
 *         description: Booking not found
 */

//getting booking by id
BookingRoutes.get("/getbooking/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    // Optionally, you can restrict access based on role or ownership
    // Example:
    // const userRole = req.headers["user-role"];
    // if (userRole !== "srdev" && booking.createdBy.toString() !== req.user._id) {
    //   return res.status(403).send({ message: "You are not authorized to view this booking." });
    // }

    return res.status(200).send({ booking });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/all:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */

//Getting all bookings
BookingRoutes.get("/all", authenticateUser, async (req, res) => {
  try {
    const Allbookings = await Booking.find({ isDeleted: false })
      .populate("user", "_id name email")
      .sort({
        createdAt: -1,
      });

    if (!Allbookings.length) {
      return res
        .status(200)
        .send({ message: "No Bookings Found", Allbookings: [] });
    }

    return res.status(200).send({
      message: "All Bookings Fetched Successfully",
      Allbookings,
    });
  } catch (err) {
    console.error("Error in /all:", err.message);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/bookings/filter:
 *   get:
 *     summary: Filter bookings with advanced filters
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Filtered bookings list
 */

// Combined filter route
BookingRoutes.get("/bookings/filter", authenticateUser, async (req, res) => {
  const {
    startDate,
    endDate,
    status,
    service,
    bdmName,
    paymentmode,
    paymentStartDate,
    paymentEndDate,
    page = 1,
    limit = 100,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    const query = {};

    // Booking date filter (if no payment date is applied)
    if (startDate && endDate && !paymentStartDate && !paymentEndDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        return res.status(400).send({ message: "Invalid booking date format" });
      }
      parsedEndDate.setHours(23, 59, 59, 999);
      query.date = { $gte: parsedStartDate, $lte: parsedEndDate };
    }

    // Payment date filter (only if provided)
    if (paymentStartDate && paymentEndDate) {
      const parsedPaymentStart = new Date(paymentStartDate);
      const parsedPaymentEnd = new Date(paymentEndDate);
      if (isNaN(parsedPaymentStart) || isNaN(parsedPaymentEnd)) {
        return res.status(400).send({ message: "Invalid payment date format" });
      }
      parsedPaymentEnd.setHours(23, 59, 59, 999);
      query.payment_date = { $gte: parsedPaymentStart, $lte: parsedPaymentEnd };
    }

    // Status filter
    if (status) {
      const validStatuses = ["Pending", "In Progress", "Completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({ message: "Invalid status value" });
      }
      query.status = new RegExp(`^${status.trim()}$`, "i");
    }

    // Service filter
    if (service) {
      query.services = { $in: [service] };
    }

    // Payment mode filter
    if (paymentmode) {
      const validPaymentModes = [
        "KOTAK MAHINDRA BANK",
        "RAZORPAY",
        "PayU",
        "Cash",
        "Cheque",
      ];
      if (!validPaymentModes.includes(paymentmode)) {
        return res.status(400).send({ message: "Invalid payment mode" });
      }
      query.bank = paymentmode;
    }

    // BDM name filter
    if (bdmName) {
      query.bdm = { $regex: new RegExp(bdmName, "i") };
    }

    // Role-based access check
    const validRoles = ["dev", "admin", "senior admin", "srdev"];
    if (!userRole || !validRoles.includes(userRole)) {
      if (!userId) {
        return res.status(403).send({
          message: "Access forbidden. No valid role or user ID provided.",
        });
      }
      query.user_id = userId;
    }

    // Exclude trashed bookings
    query.isDeleted = false;

    const totalCount = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    if (!bookings.length) {
      return res.status(200).send([]);
    }

    res.status(200).send({
      bookings,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    });
  } catch (err) {
    console.error("Error in /bookings/filter:", err.message);
    res.status(500).send({ message: err.message });
  }
});

/**
 * @swagger
 * api/v1/booking/getbookings/user/{userId}:
 *   get:
 *     summary: Get bookings by user ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User bookings fetched successfully
 */

//get bokkings by user id
BookingRoutes.get(
  "/getbookings/user/:userId",
  authenticateUser,
  async (req, res) => {
    const { userId } = req.params;

    try {
      // Fetch bookings of this specific user
      // const userBookings = await Booking.find({
      //   user_id: userId, // or use `userId` field based on your schema
      //   isDeleted: false,
      // }).sort({ createdAt: -1 });
      const userBookings = await Booking.find({
        isDeleted: false,
        $or: [{ user: userId }, { user_id: userId }],
      }).sort({ createdAt: -1 });

      if (!userBookings.length) {
        return res.status(200).send({
          message: "No bookings found for this user",
          bookings: [],
        });
      }

      return res.status(200).send({
        message: "User bookings fetched successfully",
        bookings: userBookings,
      });
    } catch (err) {
      console.error("Error in /getbookings/user/:userId:", err.message);
      return res.status(500).send({ message: err.message });
    }
  }
);

export default BookingRoutes;
