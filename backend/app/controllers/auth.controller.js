import * as authService from "../services/auth.service.js";
import { ValidationError } from "../utils/errors.js";

export async function signup(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.signup({ email, password });
    res.status(201).json({ status: "ok", ...result });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    console.error("❌ Signup error:", err);
    res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ status: "ok", ...result });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    console.error("❌ Login error:", err);
    res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}
