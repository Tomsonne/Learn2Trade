import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import  { User }  from "../app/models/index.js";

jest.unstable_mockModule("../app/models/index.js", () => ({
  User: mockUser,
}));

// --- MOCK du modèle User ---
const mockUser = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

jest.unstable_mockModule("../app/models/index.js", () => ({
  User: mockUser,
}));

// --- importer les services après le mock ---
const { createUser, getUserById, getUserByEmail, updateUser, deleteUser, isAdmin } =
  await import("../app/services/user.service.js");

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createUser hash le mot de passe et crée l’utilisateur", async () => {
    console.log("🔍 Test → createUser");
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue({
      id: "1",
      email: "user@test.com",
      password_hash: "hashedpw",
    });

    const user = await createUser({ email: "user@test.com", password: "secret" });
    console.log("Résultat createUser:", user);

    expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email: "user@test.com" } });
    expect(mockUser.create).toHaveBeenCalled();
    expect(user.email).toBe("user@test.com");
  });

  test("getUserById renvoie un utilisateur", async () => {
    console.log("🔍 Test → getUserById");
    mockUser.findByPk.mockResolvedValue({ id: "1", email: "user@test.com" });

    const user = await getUserById("1");
    console.log("Résultat getUserById:", user);

    expect(mockUser.findByPk).toHaveBeenCalledWith("1");
    expect(user.email).toBe("user@test.com");
  });

  test("getUserByEmail renvoie un utilisateur", async () => {
    console.log("🔍 Test → getUserByEmail");
    mockUser.findOne.mockResolvedValue({ id: "1", email: "user@test.com" });

    const user = await getUserByEmail("user@test.com");
    console.log("Résultat getUserByEmail:", user);

    expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email: "user@test.com" } });
    expect(user.email).toBe("user@test.com");
  });
  test("updateUser modifie l’utilisateur", async () => {
    console.log("🔍 Test → updateUser");
  
    const fakeUser = { 
      id: "1", 
      email: "old@test.com", 
      save: jest.fn().mockResolvedValue(true) 
    };
    mockUser.findByPk.mockResolvedValue(fakeUser);
  
    const result = await updateUser("1", { email: "new@test.com" });
    console.log("Résultat updateUser:", result);
  
    expect(fakeUser.save).toHaveBeenCalled();
    expect(result.email).toBe("new@test.com");
  });
  
  test("deleteUser supprime un utilisateur", async () => {
    console.log("🔍 Test → deleteUser");
  
    const fakeUser = { id: "1", destroy: jest.fn().mockResolvedValue(true) };
    mockUser.findByPk.mockResolvedValue(fakeUser);
  
    const result = await deleteUser("1");
    console.log("Résultat deleteUser:", result);
  
    expect(mockUser.findByPk).toHaveBeenCalledWith("1");
    expect(fakeUser.destroy).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
  
  test("isAdmin renvoie true si l’utilisateur est admin", async () => {
    console.log("🔍 Test → isAdmin");
  
    // On mocke un user admin
    mockUser.findByPk.mockResolvedValue({ id: "1", is_admin: true });
  
    const result = await isAdmin("1");
    console.log("Résultat isAdmin:", result);
  
    expect(mockUser.findByPk).toHaveBeenCalledWith("1");
    expect(result).toBe(true);
  });
  
  test("isAdmin renvoie false si l’utilisateur n’est pas admin", async () => {
    console.log("🔍 Test → isAdmin (false)");
  
    // On mocke un user non admin
    mockUser.findByPk.mockResolvedValue({ id: "1", is_admin: false });
  
    const result = await isAdmin("1");
    console.log("Résultat isAdmin:", result);
  
    expect(mockUser.findByPk).toHaveBeenCalledWith("1");
    expect(result).toBe(false);
  });
  
});
