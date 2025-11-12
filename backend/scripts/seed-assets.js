// Script pour peupler la table assets
import sequelize from "../app/core/db.js";
import models from "../app/models/index.js";

const { Asset } = models;

const assets = [
  { symbol: "BTCUSDT", kind: "crypto" },
  { symbol: "ETHUSDT", kind: "crypto" },
  { symbol: "BNBUSDT", kind: "crypto" },
  { symbol: "SOLUSDT", kind: "crypto" },
  { symbol: "ADAUSDT", kind: "crypto" },
  { symbol: "XRPUSDT", kind: "crypto" },
  { symbol: "DOGEUSDT", kind: "crypto" },
  { symbol: "DOTUSDT", kind: "crypto" },
];

async function seedAssets() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database");

    // Check if assets already exist
    const count = await Asset.count();
    if (count > 0) {
      console.log(`Assets table already has ${count} entries. Skipping seed.`);
      process.exit(0);
    }

    // Insert assets
    await Asset.bulkCreate(assets);
    console.log(`Successfully seeded ${assets.length} assets:`);
    assets.forEach((a) => console.log(`  - ${a.symbol}`));

    process.exit(0);
  } catch (error) {
    console.error("Error seeding assets:", error);
    process.exit(1);
  }
}

seedAssets();
