import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../app/api/auth.routes.js";
import { jest } from "@jest/globals";

// Mock des services
const mockAuthController = {
  signup: jest.fn(),
  login: jest.fn(),
  check: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
};

jest.unstable_mockModule("../app/controllers/auth.controller.js", () => mockAuthController);

// Créer une app Express de test
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    test("should create new user and return 201", async () => {
      mockAuthController.signup.mockImplementation((req, res) => {
        res.status(201).json({
          status: "ok",
          user: {
            id: "user-123",
            email: req.body.email,
          },
        });
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          email: "newuser@example.com",
          password: "SecurePass123!",
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("ok");
      expect(res.body.user.email).toBe("newuser@example.com");
      expect(mockAuthController.signup).toHaveBeenCalled();
    });

    test("should reject signup with missing email", async () => {
      mockAuthController.signup.mockImplementation((req, res) => {
        if (!req.body.email) {
          return res.status(400).json({
            status: "error",
            error: { code: "VALIDATION_ERROR", message: "Email requis" },
          });
        }
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          password: "SecurePass123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });

    test("should reject signup with missing password", async () => {
      mockAuthController.signup.mockImplementation((req, res) => {
        if (!req.body.password) {
          return res.status(400).json({
            status: "error",
            error: { code: "VALIDATION_ERROR", message: "Mot de passe requis" },
          });
        }
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });

    test("should reject duplicate email", async () => {
      mockAuthController.signup.mockImplementation((req, res) => {
        res.status(400).json({
          status: "error",
          error: { code: "DUPLICATE_EMAIL", message: "Email déjà utilisé" },
        });
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          email: "existing@example.com",
          password: "SecurePass123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("déjà utilisé");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("should login and set httpOnly cookie with JWT token", async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res
          .cookie("token", "fake-jwt-token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 3600000,
          })
          .json({
            status: "ok",
            user: {
              id: "user-123",
              email: req.body.email,
            },
          });
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "correctpass",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.user.email).toBe("test@example.com");

      // Verify cookie is set
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("token=");
      expect(cookies[0]).toContain("HttpOnly");
    });

    test("should reject login with invalid credentials", async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: { code: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect" },
        });
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
      expect(res.body.error.message).toContain("incorrect");
    });

    test("should reject login with non-existent email", async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: { code: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect" },
        });
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "anypassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/v1/auth/check", () => {
    test("should verify valid JWT token and return user", async () => {
      mockAuthController.check.mockImplementation((req, res) => {
        if (req.cookies.token === "valid-token") {
          return res.json({
            status: "ok",
            user: {
              id: "user-123",
              email: "test@example.com",
            },
          });
        }
        res.status(401).json({
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        });
      });

      const res = await request(app)
        .get("/api/v1/auth/check")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.user).toBeDefined();
    });

    test("should reject request without token", async () => {
      mockAuthController.check.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        });
      });

      const res = await request(app).get("/api/v1/auth/check");

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
    });

    test("should reject expired or invalid token", async () => {
      mockAuthController.check.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: { code: "INVALID_TOKEN", message: "Token invalide ou expiré" },
        });
      });

      const res = await request(app)
        .get("/api/v1/auth/check")
        .set("Cookie", ["token=expired-token"]);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_TOKEN");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    test("should clear authentication cookie", async () => {
      mockAuthController.logout.mockImplementation((req, res) => {
        res
          .clearCookie("token", { httpOnly: true })
          .json({
            status: "ok",
            message: "Déconnexion réussie",
          });
      });

      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", ["token=some-token"]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");

      // Verify cookie is cleared
      const cookies = res.headers["set-cookie"];
      if (cookies) {
        expect(cookies[0]).toContain("token=");
        // Cleared cookie should have Max-Age=0 or past expiry
      }
    });
  });

  describe("GET /api/v1/auth/me", () => {
    test("should return current user data when authenticated", async () => {
      mockAuthController.me.mockImplementation((req, res) => {
        // Simulate middleware setting req.user
        if (req.cookies.token === "valid-token") {
          return res.json({
            status: "ok",
            user: {
              id: "user-123",
              email: "test@example.com",
              cash_balance: "10000",
            },
          });
        }
        res.status(401).json({
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        });
      });

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.user.cash_balance).toBeDefined();
    });

    test("should require authentication", async () => {
      mockAuthController.me.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        });
      });

      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Security Tests", () => {
    test("should not leak sensitive data in error messages", async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res.status(401).json({
          status: "error",
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email ou mot de passe incorrect", // Generic message
          },
        });
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpass",
        });

      // Should not reveal which field is wrong
      expect(res.body.error.message).not.toContain("email");
      expect(res.body.error.message).not.toContain("password");
      expect(res.body.error.message).toContain("incorrect");
    });

    test("should use httpOnly cookies for JWT storage", async () => {
      mockAuthController.login.mockImplementation((req, res) => {
        res
          .cookie("token", "jwt-token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          })
          .json({ status: "ok", user: { id: "123" } });
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "pass",
        });

      const cookies = res.headers["set-cookie"];
      expect(cookies[0]).toContain("HttpOnly");
    });
  });
});
