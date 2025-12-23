import express from "express";
import cors from "cors";
import morganMiddleware from "#middlewares/logger.js";
import apiV1Routes from "./api/v1/routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "#config/swagger.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "user-role"],
  })
);

app.use(morganMiddleware);

// Swagger
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Versioned API
app.use("/api/v1", apiV1Routes);

// Health check
app.get("/", (_, res) => {
  res.send("✅ Server running");
});

export default app;
