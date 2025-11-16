// backend/app/jobs/snapshot.cron.js
// Cron job pour créer automatiquement les snapshots quotidiens

import cron from "node-cron";
import { createAllSnapshots } from "../services/snapshot.service.js";

/**
 * Initialise le cron job pour les snapshots quotidiens
 * Exécution tous les jours à 23:59 (avant minuit)
 */
export function initializeSnapshotCron() {
  // Cron expression: "minute hour * * *"
  // "59 23 * * *" = tous les jours à 23:59
  const cronExpression = "59 23 * * *"; // 23:59 chaque jour

  console.log("📅 Initialisation du cron job pour les snapshots quotidiens");
  console.log(`   Planifié pour: ${cronExpression} (23:59 chaque jour)`);

  const task = cron.schedule(
    cronExpression,
    async () => {
      console.log("\n🔄 Cron job: Création des snapshots quotidiens...");
      console.log(`   Date: ${new Date().toISOString()}`);

      try {
        const result = await createAllSnapshots();

        console.log("✅ Cron job terminé:");
        console.log(`   - Snapshots créés: ${result.snapshots.length}`);
        console.log(`   - Erreurs: ${result.errors.length}`);

        if (result.errors.length > 0) {
          console.error("⚠️  Erreurs lors de la création des snapshots:");
          result.errors.forEach((err) => {
            console.error(`   - User ${err.userId}: ${err.error}`);
          });
        }
      } catch (error) {
        console.error("❌ Erreur fatale dans le cron job:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Paris", // Ajustez selon votre fuseau horaire
    }
  );

  // Pour le développement: possibilité de créer un snapshot immédiatement
  if (process.env.CREATE_SNAPSHOT_ON_START === "true") {
    console.log("🚀 CREATE_SNAPSHOT_ON_START=true détecté");
    console.log("   Création d'un snapshot au démarrage...");

    setTimeout(async () => {
      try {
        const result = await createAllSnapshots();
        console.log(`✅ Snapshot initial créé: ${result.snapshots.length} snapshots`);
      } catch (error) {
        console.error("❌ Erreur lors du snapshot initial:", error);
      }
    }, 5000); // Attendre 5s après le démarrage
  }

  return task;
}

/**
 * Crée un snapshot manuel (pour les tests)
 */
export async function runSnapshotNow() {
  console.log("🚀 Exécution manuelle du snapshot...");
  try {
    const result = await createAllSnapshots();
    console.log(`✅ Snapshots créés: ${result.snapshots.length}`);
    console.log(`❌ Erreurs: ${result.errors.length}`);
    return result;
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  }
}

export default {
  initializeSnapshotCron,
  runSnapshotNow,
};
