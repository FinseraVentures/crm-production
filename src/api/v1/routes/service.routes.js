import express from "express";
import Service from "#models/Service.model.js";

// import servicesList from '../data/ServiceList.js'; // Adjust the import path for your services list

const ServiceRoutes = express.Router();
/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service master management APIs
 */

// ServiceRoutes.post("/bulk", async (req, res) => {
// console.log(typeof(servicesList))
//     try {
//     // const { contacts } =servicesList; // Expecting an array
//     // if (!Array.isArray(contacts)) {
//     //   return res.status(400).json({ message: "contacts must be an array" });
//     // }
//     const data=servicesList
//     const contacts = data.map(item => ({
//         label: item.label,
//         value: item.value,
//         status: item.status ? item.status : true
//     }));

//     const result = await Service.insertMany(contacts);
//     res.status(201).json({ success: true, count: result.length, data: result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

/**
 * @swagger
 * /api/v1/services:
 *   post:
 *     summary: Add a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - value
 *               - status
 *             properties:
 *               label:
 *                 type: string
 *                 example: GST Registration
 *               value:
 *                 type: string
 *                 example: gst_registration
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Service added successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
// Route to add a new service
ServiceRoutes.post("/create-service", async (req, res) => {
  const user = req.user;

  const { label, value, status, category, processingTime, serviceType } =
    req.body;

  // Validate input
  if (!label || !value || !status) {
    return res.status(400).send("Invalid input data");
  }

  // Create and save the service
  const service = {
    label,
    category,
    processingTime,
    serviceType,
    value,
    status,
  };

  try {
    const newService = await Service.create(service);
    res.status(201).send({ message: "Service added successfully", newService });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error adding service", error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/services/{id}:
 *   patch:
 *     summary: Update service details (dev only)
 *     tags: [Services]
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
 *             example:
 *               label: MSME Registration
 *               status: inactive
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: No fields provided for update
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
//edit service
ServiceRoutes.patch("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Ensure there are fields to update
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).send({ message: "No fields provided for update" });
  }

  try {
    // Update the service with provided fields
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Return updated document and validate inputs
    );

    if (!updatedService) {
      return res.status(404).send({ message: "Service not found" });
    }

    res.status(200).send({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating service", error: error.message });
  }
});
/**
 * @swagger
 * /api/v1/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *       404:
 *         description: No services found
 *       500:
 *         description: Server error
 */
//getting all services
ServiceRoutes.get("/services", async (req, res) => {
  try {
    // Fetch all services from the database
    const services = await Service.find();

    // Check if there are any services
    if (!services || services.length === 0) {
      return res.status(404).send({ message: "No services found" });
    }

    // Send the services as a response
    res.status(200).send(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .send({ message: "Error fetching services", error: error.message });
  }
});
/**
 * @swagger
 * /api/v1/services/{id}:
 *   delete:
 *     summary: Delete a service (dev only)
 *     tags: [Services]
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
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */

ServiceRoutes.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the service
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).send({ message: "Service not found" });
    }

    res.status(200).send({
      message: "Service deleted successfully",
      service: deletedService,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error deleting service", error: error.message });
  }
});

export default ServiceRoutes;
