import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyAuth } from "./middlewares/auth.middleware.js"; 


const router = Router();

// 🧠 Inscription
router.post("/signup", authController.signup);

// 🔐 Connexion (pose le cookie JWT)
router.post("/login", authController.login);

// ✅ Vérification du cookie JWT
router.get("/check", authController.check);

// 🚪 Déconnexion (efface le cookie)
router.post("/logout", authController.logout);

router.get("/me", verifyAuth, authController.me);

export default router;
