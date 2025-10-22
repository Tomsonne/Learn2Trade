// app/server.js — VERSION FINALE
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loadConfig } from "./core/config.js";
import v1Router from "./api/index.js";
import sequelize from "./core/db.js";
import models from "./models/index.js";

// ──────────────────────────────────────────────
// App & config
const cfg = loadConfig();
const app = express();

// Liste blanche des origines autorisées
const allowedOrigins = [
  "http://localhost:5173",                                   // dev local
  "https://learn2-trade.vercel.app",                         // domaine principal
  "https://learn2-trade-iovrk9oci-tomsonnes-projects.vercel.app", // preview Vercel (branche Thomas)
];

// Middleware CORS dynamique
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS refusé pour :", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Autorise toutes les requêtes préflight (OPTIONS)
app.options("/*", cors()); // doit être placé AVANT les routes

app.use(express.json());
app.use(cookieParser());

// ──────────────────────────────────────────────
// HealthCheck
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// API v1
app.use("/api/v1", v1Router);

// ──────────────────────────────────────────────
// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// ──────────────────────────────────────────────
// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error("ERR:", err.message || err);
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
    console.log("✅ DB connected");

    console.log("Models chargés :", Object.keys(models));
    console.log("🌍 CORS autorisé depuis :", allowedOrigins);

    await sequelize.sync({ alter: true });
    console.log("✅ Sequelize sync done");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Learn2Trade backend (Node) running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

// ──────────────────────────────────────────────
// Arrêt propre (Docker)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  try {
    await sequelize.close();
  } catch {}
  process.exit(0);
});
