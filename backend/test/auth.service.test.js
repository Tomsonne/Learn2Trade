import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

// --- MOCK du modèle User ---
const mockUser = {
  findOne: jest.fn(),
  create: jest.fn(),
};

jest.unstable_mockModule("../app/models/index.js", () => ({
  User: mockUser,
}));

// importer après le mock
const { signup, login } = await import("../app/services/auth.service.js");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("signup crée un nouvel utilisateur et retourne un objet avec token et user", async () => {
    console.log("🔍 Test → signup");
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password_hash: "hashedpw",
    });

    const result = await signup({ email: "test@test.com", password: "1234" });
    console.log("Résultat signup:", result);

    expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email: "test@test.com" } });
    expect(mockUser.create).toHaveBeenCalled();
    expect(typeof result.access_token).toBe("string");
    expect(result.user.email).toBe("test@test.com");
  });

  test("signup échoue si email déjà utilisé", async () => {
    console.log("🔍 Test → signup email déjà utilisé");
    mockUser.findOne.mockResolvedValue({ id: "1", email: "test@test.com" });

    await expect(signup({ email: "test@test.com", password: "1234" }))
      .rejects.toThrow("Email déjà utilisé");
  });

  test("login échoue si email n’existe pas", async () => {
    console.log("🔍 Test → login email introuvable");
    mockUser.findOne.mockResolvedValue(null);

    await expect(login("wrong@test.com", "1234"))
      .rejects.toThrow("Identifiants invalides");
  });

  test("login réussit avec bon mot de passe", async () => {
    console.log("🔍 Test → login succès");
    const hashed = await bcrypt.hash("1234", 10);
    mockUser.findOne.mockResolvedValue({
      id: "1",
      email: "ok@test.com",
      password_hash: hashed,
    });

    const result = await login("ok@test.com", "1234");
    console.log("Résultat login:", result);

    expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email: "ok@test.com" } });
    expect(typeof result.access_token).toBe("string");
    expect(result.user.email).toBe("ok@test.com");
  });
});
