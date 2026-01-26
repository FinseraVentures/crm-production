import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

const welcomeRoutes = express.Router();

/**
 * @swagger
 * /api/welcome:
 *   post:
 *     summary: Send welcome email to client
 *     description: Sends a professionally formatted welcome email to a newly onboarded client.
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WelcomeEmailRequest'
 *     responses:
 *       200:
 *         description: Welcome email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome Mail Sent Successfully.
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error while sending email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

welcomeRoutes.post("/welcome", async (req, res) => {
  const { email } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: `${mailUser}`,
        pass: `${mailPass}`,
      },
    });

    const mailOptions = {
      to: email,
      from: "bookings@finseraa.org",
      subject: "Booking Confirmation – Finsera Ventures Private Limited",
      html: `
    <p>Dear Sir/Madam,</p>

    <p>
      Thank you for placing your booking with 
      <b>Finsera Ventures Private Limited</b>.
      We have successfully received your request and are pleased to confirm the same.
    </p>

    <p>
      Our team is currently reviewing the details of your booking.
      One of our representatives will reach out to you shortly to coordinate
      and gather any additional information, if required.
    </p>

    <p>
      At <b>Finsera Ventures Private Limited</b>, we are committed to delivering
      reliable and high-quality services tailored to your requirements.
      Your trust in us is highly valued, and we look forward to working with you.
    </p>

    <p>
      If you have any questions or need immediate assistance, please contact us at
      <a href="mailto:support@finseraa.org">support@finseraa.org</a>.
    </p>

    <p style="color: #555; font-size: 14px; margin-top: 20px;">
      <i>This is an automated email sent after booking confirmation.</i>
    </p>

    <p>Warm regards,</p>
    <p><b>Finsera Ventures Private Limited</b></p>
    <p><a href="https://finseraa.com">finseraa.com</a></p>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Welcome Mail Sent Successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default welcomeRoutes;
