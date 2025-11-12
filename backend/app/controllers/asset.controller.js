import Asset from "../models/asset.model.js";

export async function getAllAssets(req, res) {
  try {
    const assets = await Asset.findAll();
    res.json({ data: assets });
  } catch (err) {
    console.error("Erreur getAllAssets:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
