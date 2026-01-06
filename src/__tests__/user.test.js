import request from "supertest";
import app from "../app.js";
import { jest } from "@jest/globals";
import { connectTestDB, closeTestDB } from "../tests/setup/db.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

jest.mock("#middlewares/authMiddleware.js", () => ({
  __esModule: true,

  authenticateUser: (req, res, next) => {
    req.user = {
      id: "test-user-id",
      user_role: "srdev", // required for authorizeDevRole
    };

    next();
  },

  authorizeDevRole: (req, res, next) => next(),
}));

describe("User API", () => {
  it("should create a new user", async () => {
    const res = await request(app).post("/api/v1/user/adduser").send({
      name: "Test User",
      email: "test@example.com",
      password: "Test@123",
      user_role: "admin",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });
});
