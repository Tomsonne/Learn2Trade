// app/server.js — VERSION FINALE (Railway + Vercel)

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loadConfig } from "./core/config.js";
import v1Router from "./api/index.js";
import sequelize from "./core/db.js";
import models from "./models/index.js";

// ──────────────────────────────────────────────
// Chargement config & initialisation app
const cfg = loadConfig();
const app = express();

// ──────────────────────────────────────────────
// Configuration CORS (frontend Vercel + local)
const allowedOrigins = [
  "http://localhost:5173", // dev local
  "https://learn2-trade.vercel.app", // domaine principal
  "https://learn2-trade-iovrk9oci-tomsonnes-projects.vercel.app", // preview (branche Thomas)
  "https://learn2-trade-oyidrp70d-tomsonnes-projects.vercel.app", // preview (nouveau déploiement)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // autorise l’envoi des cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Autorise toutes les requêtes préflight (OPTIONS)
app.options(/.*/, cors({ origin: allowedOrigins, credentials: true }));

//app.options("*", cors({ origin: allowedOrigins, credentials: true }));
//mauvaise version express
// ──────────────────────────────────────────────
// Middlewares généraux
app.use(express.json());
app.use(cookieParser());

// ──────────────────────────────────────────────
// HealthCheck
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// ──────────────────────────────────────────────
// Routes principales (API v1)
app.use("/api/v1", v1Router);

// ──────────────────────────────────────────────
// 404 — Route non trouvée
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// ──────────────────────────────────────────────
// Gestion des erreurs serveur
app.use((err, req, res, _next) => {
  console.error(" ERR:", err.message || err);
  res.status(500).json({
    status: "error",
    error: {
      code: "SERVER_ERROR",
      message: err.message,
      detail: err?.parent?.detail || err?.original?.detail || null,
    },
  });
});

// ──────────────────────────────────────────────
// Démarrage du serveur
async function start() {
  try {
    await sequelize.authenticate();
    console.log("Base de données connectée");

    console.log("Models chargés :", Object.keys(models));
    console.log("Origines CORS autorisées :", allowedOrigins);

    await sequelize.sync({ alter: false });
    console.log("Synchronisation Sequelize terminée");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Learn2Trade backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

// ──────────────────────────────────────────────
// Arrêt propre (Docker / Railway)
process.on("SIGTERM", async () => {
  console.log("SIGTERM reçu, arrêt du serveur...");
  try {
    await sequelize.close();
    console.log("Connexion DB fermée proprement");
  } catch {
    console.warn("Erreur lors de la fermeture de la DB");
  }
  process.exit(0);
});
