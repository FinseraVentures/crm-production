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
  const userId = req.user._id;
  const userRole = req.user.user_role;
  console.log(userRole);

  try {
    if (userRole === "bdm") {
      const bookingsCount = await Booking.countDocuments({
        $or: [{ user: userId }, { user_id: userId }],
      });

      const recentBookings = await Booking.find({
        $or: [{ user: userId }, { user_id: userId }],
      })
        .populate("user", "name email user_role")
        .sort({ createdAt: -1 })
        .limit(5);
      const bookings = await Booking.find({
        $or: [{ user: userId }, { user_id: userId }],
      });
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todayRevenue = await Booking.aggregate([
        {
          $match: {
            user: userId,
            isDeleted: false,
            payment_date: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $add: [
                  { $ifNull: ["$term_1", 0] },
                  { $ifNull: ["$term_2", 0] },
                  { $ifNull: ["$term_3", 0] },
                ],
              },
            },
          },
        },
      ]);

      const { month, year, startOfMonth, endOfMonth } = getMonthDateRange(
        req.query
      );

      const currentMonthlyRevenue = await Booking.aggregate([
        {
          $match: {
            user: userId,
            isDeleted: false,
            payment_date: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $add: [
                  { $ifNull: ["$term_1", 0] },
                  { $ifNull: ["$term_2", 0] },
                  { $ifNull: ["$term_3", 0] },
                ],
              },
            },
          },
        },
      ]);

      const usersCount = await User.countDocuments();
      return res.status(200).json({
        data: {
          bookings,
          currentMonthlyRevenue,
          todayRevenue,
          totalBookings: bookingsCount,
          totalUsers: usersCount,
          recentBookings,
        },
      });
    } else {
      const bookingsCount = await Booking.countDocuments();
      const bookings = await Booking.find();
      const { month, year, startOfMonth, endOfMonth } = getMonthDateRange(
        req.query
      );
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todayRevenue = await Booking.aggregate([
        {
          $match: {
            payment_date: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $add: [
                  { $ifNull: ["$term_1", 0] },
                  { $ifNull: ["$term_2", 0] },
                  { $ifNull: ["$term_3", 0] },
                ],
              },
            },
          },
        },
      ]);

      const currentMonthlyRevenue = await Booking.aggregate([
        {
          $match: {
            payment_date: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $add: [
                  { $ifNull: ["$term_1", 0] },
                  { $ifNull: ["$term_2", 0] },
                  { $ifNull: ["$term_3", 0] },
                ],
              },
            },
          },
        },
      ]);

      const recentBookings = await Booking.find()
        .populate("user", "name email user_role")
        .sort({ createdAt: -1 })
        .limit(5);
      const usersCount = await User.countDocuments();
      res.status(200).json({
        data: {
          bookings,
          currentMonthlyRevenue,
          todayRevenue,
          totalBookings: bookingsCount,
          totalUsers: usersCount,
          recentBookings,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching bookings count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getMonthDateRange = ({ month, year } = {}) => {
  const now = new Date();
  if (month && (month < 1 || month > 12)) {
    throw new Error("Invalid month");
  }

  const targetYear = year ? Number(year) : now.getFullYear();
  const targetMonth = month
    ? Number(month) - 1 // JS months are 0-based
    : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 1);

  return {
    startOfMonth,
    endOfMonth,
    month: targetMonth + 1,
    year: targetYear,
  };
};

export default router;
