import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// export const authenticateUser = async (req, res, next) => {
//   try {
//     // ✅ Test env shortcut
//     if (process.env.NODE_ENV === "test") {
//       req.user = {
//         _id: "test-user-id",
//         user_role: "srdev",
//       };
//       return next();
//     }

//     // ✅ You are NOT using Bearer
//     const token = req.headers.authorization;

//     if (!token) {
//       return res.status(401).json({ message: "Authentication required" });
//     }

//     // ✅ Verify raw token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ Fetch full user from DB
//     const user = await User.findById(decoded.id).select(
//       "_id name email user_role"
//     );

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     // ✅ THIS is what fixes everything
//     req.user = user;

//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// Middleware to check if the user is a 'dev'
export const authorizeDevRole = (req, res, next) => {
  console.log("User role:", req.user?.user_role);
  if (process.env.NODE_ENV === "test") return next();
  if (req.user?.user_role !== "srdev") {
    return res
      .status(403)
      .send({ message: "Access denied. Only devs can access this route." });
  }
  next(); // Proceed if the user has the 'dev' role
};
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      _id: decoded.userId,
      user_role: decoded.user_role,
    };
    // console.log("req user", req.user);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
