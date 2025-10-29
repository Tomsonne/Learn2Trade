import * as authService from "../services/auth.service.js";
import { ValidationError } from "../utils/errors.js";
import  User from "../models/user.model.js";

/* -------------------------------------------------------------------------- */
/*  INSCRIPTION                                                             */
/* -------------------------------------------------------------------------- */
export async function signup(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.signup({ email, password });
    return res.status(201).json({ status: "ok", ...result });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    console.error(" Signup error:", err);
    return res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}

/* -------------------------------------------------------------------------- */
/*  CONNEXION                                                               */
/* -------------------------------------------------------------------------- */
export async function login(req, res) {
  console.log("Route /api/v1/auth/login atteinte");

  try {
    const { email, password } = req.body;

    // Vérifie que les champs existent
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email et mot de passe requis" });
    }

    const result = await authService.login(email, password);

    if (!result || !result.access_token) {
      console.error("Aucun token reçu de authService.login");
      return res.status(500).json({
        status: "error",
        message: "Erreur interne (token manquant)"
      });
    }

    const isDev = process.env.NODE_ENV !== "production";

    // Création du cookie JWT
    res.cookie("token", result.access_token, {
      httpOnly: true,
      secure: !isDev,                  // false en local, true en prod
      sameSite: isDev ? "Lax" : "None",
      path: "/",
      maxAge: 60 * 60 * 1000,          // 1h
    });

    console.log("Cookie JWT défini pour :", email);
    return res.json({ status: "ok", message: "Connexion réussie" });

  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    console.error("Login error:", err);
    return res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}

/* -------------------------------------------------------------------------- */
/*  VÉRIFICATION DE SESSION                                                 */
/* -------------------------------------------------------------------------- */
export async function check(req, res) {
  console.log("Route /api/v1/auth/check atteinte");

  try {
    const cookies = req.cookies || {};
    const token = cookies.token;
    if (!token) {
      console.log("Aucun token trouvé");
      return res.status(401).json({ status: "error", message: "Non connecté" });
    }

    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (verifyErr) {
      console.error("Erreur vérification token :", verifyErr.message);
      return res.status(401).json({ status: "error", message: "Token invalide ou expiré" });
    }

    //  Récupération complète du user depuis la base
    const dbUser = await User.findByPk(decoded.id, {
      attributes: ["id", "email", "is_admin", "cash", "created_at", "updated_at"],
    });

    if (!dbUser) {
      console.log("Utilisateur introuvable en base");
      return res.status(404).json({ status: "error", message: "Utilisateur introuvable" });
    }

    console.log("Utilisateur trouvé :", dbUser.email, "Cash =", dbUser.cash);
    return res.json({ status: "ok", user: dbUser });

  } catch (err) {
    console.error("Erreur check globale :", err);
    return res.status(500).json({ status: "error", message: "Erreur serveur interne" });
  }
}

/* -------------------------------------------------------------------------- */
/*  DÉCONNEXION                                                            */
/* -------------------------------------------------------------------------- */
export async function logout(req, res) {
  try {
    const isDev = process.env.NODE_ENV !== "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? "Lax" : "None",
      path: "/", // obligatoire
    });

    console.log("👋 Utilisateur déconnecté, cookie supprimé");
    return res.json({ status: "ok", message: "Déconnecté" });
  } catch (err) {
    console.error(" Logout error:", err);
    return res.status(500).json({ status: "error", message: "Erreur serveur" });
  }
}



export const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    res.json({ id: req.user.id, email: req.user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
