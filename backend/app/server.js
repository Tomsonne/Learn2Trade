// app/server.js  — VERSION PROPRE
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // ✅ ajouté
import { loadConfig } from "./core/config.js";
import v1Router from "./api/index.js";
import sequelize from "./core/db.js";
import models from "./models/index.js"; // charge *.model.js (important)

// (OPTION) cron pour ingestion auto CoinDesk
// import cron from "node-cron";
// import { refreshNewsFromCoinDesk } from "./services/news.service.js";

// ──────────────────────────────────────────────
// App & config
const cfg = loadConfig();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // le front
    credentials: true,               // 🔥 permet d’envoyer les cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
// Start server + DB
async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    console.log("Models chargés :", Object.keys(models));
    console.log("🌍 CORS autorisé depuis :", cfg.corsOrigin);

    await sequelize.sync(); // synchronisation douce
    console.log("✅ Sequelize sync done");

    // (OPTION) lancer une ingestion au démarrage + cron périodique
    // try {
    //   const saved = await refreshNewsFromCoinDesk();
    //   console.log(`🔄 Boot refresh: saved ${saved} news`);
    // } catch (e) {
    //   console.error("Boot refresh error:", e?.message || e);
    // }
    // const cronExpr = process.env.NEWS_CRON || "*/10 * * * *"; // toutes les 10 min
    // cron.schedule(cronExpr, async () => {
    //   try {
    //     const saved = await refreshNewsFromCoinDesk();
    //     console.log(`[cron ${cronExpr}] saved ${saved}`);
    //   } catch (e) {
    //     console.error("[cron] error:", e?.message || e);
    //   }
    // });

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
