import express from "express";
import User from "#models/User.model.js";
import Booking from "#models/Booking.model.js";
import crypto from "crypto"; // Used to generate random tokens
import nodemailer from "nodemailer"; // Used to send emails
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import e from "express";
import { authenticateUser } from "#middlewares/authMiddleware.js";
import { contextMiddleware } from "#middlewares/context.middleware.js";
dotenv.config();
const saltRounds = 5;

const UserRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management, authentication, and password flows
 */

/**
 * @swagger
 * /api/v1/user/adduser:
 *   post:
 *     summary: Create a new user (dev only)
 *     tags: [Users]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               user_role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already registered
 */

//Creating User
UserRoutes.post(
  "/adduser",
  authenticateUser,
  contextMiddleware,

  async (req, res) => {
    try {
      const { name, email, password, user_role } = req.body;
      // Check if all required fields are provided
      if (!name || !email || !password) {
        return res.status(400).send({
          message: "send all required fields: name, email, password",
        });
      }

      // Convert email to lowercase
      const normalizedEmail = email.toLowerCase();
      const normalizedRole = user_role.toLowerCase();

      // Check if the email is already registered
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).send({ message: "Email is already registered" });
      }

      // Hash the password before saving the user
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user with hashed password
      const new_user = {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        user_role: normalizedRole,
      };

      const user = await User.create(new_user);
      const safeUser = user.toObject();
      delete safeUser.password;

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          _id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          user_role: safeUser.user_role,
          createdAt: safeUser.createdAt,
        },
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/user/edituser/{id}:
 *   patch:
 *     summary: Update user details (dev only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

//edit user
UserRoutes.patch(
  "/edituser/:id",
  authenticateUser,
  contextMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Ensure there are fields to update
      if (!updates || Object.keys(updates).length === 0) {
        return res
          .status(400)
          .send({ message: "No fields provided for update" });
      }
      if (updates.user_role) {
        updates.user_role = updates.user_role.toLowerCase();
      }
      // Normalize email if it's being updated
      if (updates.email) {
        updates.email = updates.email.toLowerCase();

        // Check if the new email is already registered
        const existingUser = await User.findOne({
          email: updates.email,
          _id: { $ne: id },
        });
        if (existingUser) {
          return res
            .status(409)
            .send({ message: "Email is already registered" });
        }
      }

      // Hash the password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, saltRounds);
      }

      // Update user by ID
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true } // Return updated user and validate fields
      );

      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }

      return res
        .status(200)
        .send({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/users/deleteuser/{id}:
 *   delete:
 *     summary: Delete user (dev only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 */

// Deleting User
UserRoutes.delete(
  "/deleteuser/:id",
  authenticateUser,
  contextMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params; // Assuming you are using a unique ID for the user

      // Check if the user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).send({ message: "User not found" });
      }

      // Delete the user
      await User.findByIdAndDelete(id);

      return res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of users
 */

//listing all users
UserRoutes.get(
  "/all",
  authenticateUser,
  contextMiddleware,
  async (req, res) => {
    try {
      const Users = await User.find({}).select("-password");
      if (Users.length === 0) {
        return res.status(404).send({
          message: "No Users found",
        });
      }
      const no_of_users = Users.length;

      res.status(200).send({ Users });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ message: error.message });
    }
  }
);

// Assuming you already have the user object after login
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      user_role: user.user_role,
      userName: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "12h", // Set token expiration time
    }
  );
};

/**
 * @swagger
 * /api/v1/user/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

//login
UserRoutes.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        message: "Please provide both email and password.",
      });
    }

    // Find the user by email
    const user = await User.findOneAndUpdate({ email }, { isActive: true });

    if (!user) {
      return res.status(404).send({
        message: "User not found.",
      });
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid email or password.",
      });
    }
    const token = generateToken(user); // Generate JWT token

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    res.status(200).json({
      success: true,
      token,
      user: sanitizedUser, // safe object
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/user/logout/{id}:
 *   patch:
 *     summary: Logout user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User logged out
 */

//logout
UserRoutes.patch("/logout/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { isActive: false });

    if (!user) {
      return res.status(404).send({
        message: "User not found.",
      });
    }
    res.send(user);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

//getting all the bookings for specific user
UserRoutes.get("/bookings/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.params.id) {
      return res.status(400).send({
        message: "Not A VALID USER",
      });
    }
    const Bookings = await Booking.find({ user_id: id });

    if (Bookings.length === 0) {
      return res.status(404).send({
        message: "No bookings found for this user",
      });
    }
    res.status(200).send(Bookings);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//unified search
UserRoutes.get("/:id?", async (req, res) => {
  const booking_id = req.params.id; // This may be undefined if no id is provided
  const searchPattern = req.query.pattern; // Search pattern from the query parameter
  const userRole = req.query.userRole; // Assuming user's role is stored in req.user
  const userId = req.query.userId; // Assuming user's ID is stored in req.user

  let contactNo = parseInt(searchPattern);

  try {
    let Booking;

    if (booking_id) {
      // If an ID is provided, search by the booking ID
      if (["dev", "admin", "senior admin", "srdev"].includes(userRole)) {
        Booking = await Booking.find({ _id: booking_id });
      } else {
        // If the user is not dev, admin, or senior admin, search only within their bookings
        Booking = await Booking.find({ _id: booking_id, user_id: userId });
      }

      if (Booking.length === 0) {
        return res.status(404).send({
          message: "No bookings found with this id",
        });
      }
    } else if (searchPattern) {
      // Combine search for both company_name and contact_person under the same pattern
      const searchQuery = {
        $or: [
          { company_name: { $regex: searchPattern, $options: "i" } },
          { contact_person: { $regex: searchPattern, $options: "i" } },
          { email: { $regex: searchPattern, $options: "i" } },
          { pan: { $regex: searchPattern, $options: "i" } },
          { gst: { $regex: searchPattern, $options: "i" } },
          { services: { $regex: searchPattern, $options: "i" } },
          { bdm: { $regex: searchPattern, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$contact_no" },
                regex: searchPattern,
              },
            },
          },
        ],
      };

      if (["dev", "admin", "senior admin", "srdev"].includes(userRole)) {
        Booking = await Booking.find(searchQuery);
      } else {
        // Search within user's bookings only if not dev, admin, or senior admin
        Booking = await Booking.find({
          ...searchQuery,
          user_id: userId, // Ensure the user only gets their own bookings
        });
      }

      if (Booking.length === 0) {
        return res.status(404).send({
          message: "No bookings found matching the pattern",
        });
      }
    } else {
      // If neither an ID nor a search pattern is provided, return an error
      return res.status(400).send({
        message: "Either id or pattern query parameter is required",
      });
    }
    res.status(200).send(Booking);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//check user is a valid or not
UserRoutes.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.params.id) {
      return res.status(400).send({
        message: "Not A VALID USER",
      });
    }
    const User = await User.find({ _id: id });

    if (User.length === 0) {
      return res.status(404).send({
        message: "No User found with this id",

        status: false,
      });
    }
    res.status(200).send({ message: "VALID USER", status: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/password-reset:
 *   put:
 *     summary: Reset password using email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */

//password reset
UserRoutes.put("/password-reset", async (req, res) => {
  const { password, email } = req.body;

  // Validate if email and password are provided
  if (!email || !password) {
    return res.status(400).send({
      message: "Please provide both email and new password",
    });
  }

  // Convert email to lowercase
  const normalizedEmail = email.toLowerCase();

  try {
    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail });

    // If no user is found, send an error response
    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found with this email" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Send success response
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/request-reset-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */

// Route to request password reset
UserRoutes.post("/request-reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Token expires in 1 hour
    const resetPasswordExpires = Date.now() + 3600000;

    // Save the token and expiration to the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create a reset URL with the token
    const resetUrl = `http://localhost:5353/user/reset-password/${resetToken}`;

    // Send an email with the reset link (setup `nodemailer` transport)
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: "siteadmin@enego.co.in",
        pass: "Siteadmin@enego@321",
      },
    });

    const mailOptions = {
      to: user.email,
      from: "siteadmin@enego.co.in",
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.\n\n
      Please click the following link, or paste it into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * @swagger
 * /api/v1/users/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

//password reset route
UserRoutes.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the user by reset token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,

      resetPasswordExpires: { $gt: Date.now() }, // Check if token has not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Save the new password and clear the reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default UserRoutes;
