// app/core/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// 🔌 Récupère l’URL complète depuis .env
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ Erreur : aucune DATABASE_URL trouvée dans le .env");
  process.exit(1);
}

// 🧩 Crée l’instance Sequelize
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

// 🚀 Test de connexion
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion établie avec Supabase PostgreSQL !");
  } catch (error) {
    console.error("❌ Erreur connexion Supabase :", error.message);
  }
})();

export default sequelize;
