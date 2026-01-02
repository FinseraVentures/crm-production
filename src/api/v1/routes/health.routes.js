import express from "express";
import Booking from "#models/Booking.model.js";
import User from "#models/User.model.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";
import e from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

router.get("/dashboard", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    if (userRole === "bdm") {
      const bookingsCount = await Booking.countDocuments({ user: userId });
      const recentBookings = await Booking.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5);
      const usersCount = await User.countDocuments();
      return res
        .status(200)
        .json({ bookingsCount, usersCount, recentBookings });
    } else {
      const bookings = await Booking.countDocuments();
      const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5);
      const usersCount = await User.countDocuments();
      res.status(200).json({
        bookings,
        usersCount,
        recentBookings,
      });
    }
  } catch (error) {
    console.error("Error fetching bookings count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
