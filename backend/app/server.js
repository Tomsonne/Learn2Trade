import express from "express";
import cors from "cors";
import { loadConfig } from "./core/config.js";
import v1Router from "./api/index.js";
import sequelize from "./core/db.js";
import models from "./models/index.js"; // charge *.model.js (important)

// ──────────────────────────────────────────────
// App & config
const cfg = loadConfig();
const app = express();

app.use(express.json());
app.use(cors({ origin: cfg.corsOrigin, credentials: true }));

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
// Start server + DB
async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    console.log("Models chargés :", Object.keys(models));

    await sequelize.sync(); // synchronisation douce
    console.log("✅ Sequelize sync done");

    app.listen(cfg.port, "0.0.0.0", () => {
      console.log(`✅ Learn2Trade backend (Node) on http://0.0.0.0:${cfg.port}`);
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
