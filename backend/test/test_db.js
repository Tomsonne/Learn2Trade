// test-db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion réussie à Supabase !");
  } catch (error) {
    console.error("Erreur connexion :", error);
  } finally {
    await sequelize.close();
  }
})();
