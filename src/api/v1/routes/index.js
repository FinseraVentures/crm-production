import { Router } from "express";
import userRoutes from "./user.routes.js";
import bookingRoutes from "./booking.routes.js";
import serviceRoutes from "./service.routes.js";
import employeeRoutes from "./employee.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import leadRoutes from "./lead.routes.js";
import adminRoutes from "./admin.routes.js";
import paymentRoutes from "./payment.routes.js";
import emailRoutes from "./email.routes.js";
import welcomeRoutes from "./welcome.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/booking", bookingRoutes);
router.use("/services", serviceRoutes);
router.use("/employee", employeeRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/leads", leadRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);
router.use("/email", emailRoutes);
router.use("/mail", welcomeRoutes);
router.use("/health", healthRoutes);

export default router;
