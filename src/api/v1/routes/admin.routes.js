import express from "express";
import User from "#models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AdminRoutes = express.Router();

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Email or password missing
 *       401:
 *         description: Invalid email or password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

//login
AdminRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        message: "Please provide both email and password.",
      });
    }

    // Find the user by email
    const user = await User.findOneAndUpdate(
      { email },
      { isActive: true }
    );

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

    // If credentials are valid, send a success response
    res.status(200).send({
      token,
      user,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/logout/{id}:
 *   patch:
 *     summary: Admin logout
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

//logout
AdminRoutes.patch("/logout/:id", async (req, res) => {
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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization APIs
 */

// Assuming you already have the user object after login
export const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, user_role: user.user_role },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h", // Set token expiration time
    }
  );
};

export default AdminRoutes;
