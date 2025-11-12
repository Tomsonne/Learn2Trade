//gestion profil utilisateur.

// app/controllers/user.controller.js
import * as userService from "../services/user.service.js";
import { ValidationError } from "../utils/errors.js";

// =============================
//   CREATE USER 
// =============================
export async function createUser(req, res) {
  try {
    const { email, password, is_admin } = req.body;
    const user = await userService.createUser({ email, password, is_admin });
    res.status(201).json({ status: "ok", data: user });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   GET USER BY ID
// =============================
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json({ status: "ok", data: user });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   GET USER BY EMAIL
// =============================
export async function getUserByEmail(req, res) {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    res.json({ status: "ok", data: user });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   UPDATE USER
// =============================
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    res.json({ status: "ok", data: user });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   DELETE USER
// =============================
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.json({ status: "ok", data: result });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   CHECK ADMIN
// =============================
export async function checkIsAdmin(req, res) {
  try {
    const { id } = req.params;
    const is_admin = await userService.isAdmin(id);
    res.json({ status: "ok", data: { is_admin } });
  } catch (err) {
    handleError(res, err);
  }
}

// =============================
//   Factorisation gestion erreurs
// =============================
function handleError(res, err) {
  if (err instanceof ValidationError) {
    res.status(400).json({ status: "error", message: err.message });
  } else {
    console.error("user.controller error:", err);
    res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}
