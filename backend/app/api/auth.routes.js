// app/api/auth.routes.js
import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Inscription
router.post("/signup", authController.signup);

// Connexion (pose le cookie JWT)
router.post("/login", authController.login);

// Vérification du cookie JWT
router.get("/check", authController.check);

// Déconnexion (efface le cookie)
router.post("/logout", authController.logout);

export default router;
