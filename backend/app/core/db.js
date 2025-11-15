// app/core/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Charge .env seulement si le fichier existe (dev local)
dotenv.config();

// Récupère l'URL complète depuis .env ou variables d'environnement
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("⚠️  ATTENTION: DATABASE_URL n'est pas définie!");
  console.error("Variables d'environnement disponibles:", Object.keys(process.env).join(", "));
  console.error("NODE_ENV:", process.env.NODE_ENV);
  console.error("PORT:", process.env.PORT);
  // Commenté temporairement pour debug Railway
  // process.exit(1);
}

// Crée l'instance Sequelize
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false, // mets true si tu veux voir les requêtes SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // nécessaire pour Supabase
    },
  },
});

// Test de connexion
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion établie avec Supabase PostgreSQL !");
  } catch (error) {
    console.error("Erreur connexion Supabase :", error.message);
  }
})();

export default sequelize;
