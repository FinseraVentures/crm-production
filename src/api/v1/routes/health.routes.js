import express from "express";
import Booking from "#models/Booking.model.js";
import User from "#models/User.model.js";
import { authenticateUser } from "#middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------- helpers -------------------- */
const formatDate = (date) => date.toISOString().split("T")[0];

export const getMonthDateRange = ({ month, year } = {}) => {
  const now = new Date();

  if (month && (month < 1 || month > 12)) {
    throw new Error("Invalid month");
  }

  const targetYear = year ? Number(year) : now.getFullYear();
  const targetMonth = month ? Number(month) - 1 : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 1);

  return {
    startOfMonth: formatDate(startOfMonth),
    endOfMonth: formatDate(endOfMonth),
    month: targetMonth + 1,
    year: targetYear,
  };
};
/* ------------------------------------------------- */

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

router.get("/dashboard", authenticateUser, async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.user_role;

  try {
    const todayStr = formatDate(new Date());
    const { startOfMonth, endOfMonth } = getMonthDateRange(req.query);

    if (userRole === "bdm") {
      const bookingsFilter = {
        $or: [{ user: userId }, { user_id: userId }],
      };

      const bookingsCount = await Booking.countDocuments(bookingsFilter);

      const bookings = await Booking.find(bookingsFilter);

      const recentBookings = await Booking.find(bookingsFilter)
        .populate("user", "name email user_role")
        .sort({ createdAt: -1 })
        .limit(5);

      const todayRevenue = await Booking.aggregate([
        {
          $match: {
            ...bookingsFilter,
            isDeleted: false,
            payment_date: todayStr,
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
            ...bookingsFilter,
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
          recentBookings,
          todayRevenue,
          currentMonthlyRevenue,
          totalBookings: bookingsCount,
          totalUsers: usersCount,
        },
      });
    }

    /* -------------------- ADMIN / OTHERS -------------------- */

    const bookingsCount = await Booking.countDocuments();
    const bookings = await Booking.find();

    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          isDeleted: false,
          payment_date: todayStr,
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

    const recentBookings = await Booking.find()
      .populate("user", "name email user_role")
      .sort({ createdAt: -1 })
      .limit(5);

    const usersCount = await User.countDocuments();

    res.status(200).json({
      data: {
        bookings,
        recentBookings,
        todayRevenue,
        currentMonthlyRevenue,
        totalBookings: bookingsCount,
        totalUsers: usersCount,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
