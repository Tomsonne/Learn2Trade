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

    if (!result || !result.access_token) {
      console.error("❌ Aucun token reçu de authService.login");
      return res.status(500).json({ status: "error", message: "Erreur interne (token manquant)" });
    }

    // ✅ Déclare ici la variable avant de l'utiliser
    const isDev = process.env.NODE_ENV !== "production";

    // ✅ Génération du cookie JWT
    res.cookie("token", result.access_token, {
      httpOnly: true,
      secure: !isDev,                // 🔥 false en local, true en prod
      sameSite: isDev ? "Lax" : "None", // 🔥 Chrome bloque SameSite=None sans HTTPS
      path: "/",
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.json({ status: "ok", message: "Connexion réussie" });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    console.error("❌ Login error:", err);
    res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}


// ✅ Nouveau contrôleur : vérifier la connexion à partir du cookie
export async function check(req, res) {
  try {
    console.log("🧩 Cookies reçus :", req.cookies); // <-- debug

    const token = req.cookies.token;
    if (!token) {
      console.log("❌ Aucun token trouvé");
      return res.status(401).json({ status: "error", message: "Non connecté" });
    }

    const decoded = authService.verifyToken(token);
    res.json({ status: "ok", user: decoded });
  } catch (err) {
    console.error("❌ Erreur check :", err);
    res.status(401).json({ status: "error", message: "Token invalide" });
  }
}


export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ status: "ok", message: "Déconnecté" });
}
