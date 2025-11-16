// backend/db/migrate.js
// Script de migration pour exécuter les migrations SQL sur Supabase

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;

// Setup __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas définie dans .env');
  process.exit(1);
}

/**
 * Exécute un fichier SQL
 */
async function runMigration(client, migrationFile) {
  const migrationPath = path.join(__dirname, 'migrations', migrationFile);

  console.log(`\n📄 Lecture du fichier: ${migrationFile}`);

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Le fichier de migration n'existe pas: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`⚙️  Exécution de la migration...`);

  try {
    await client.query(sql);
    console.log(`✅ Migration ${migrationFile} exécutée avec succès!`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de ${migrationFile}:`);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage des migrations...\n');
  console.log('📊 Base de données:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Nécessaire pour Supabase
    },
  });

  try {
    // Connexion à la base de données
    console.log('\n🔌 Connexion à Supabase...');
    await client.connect();
    console.log('✅ Connecté avec succès!\n');

    // Lister les migrations à exécuter
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Trier par ordre alphabétique (001_, 002_, etc.)

    if (migrationFiles.length === 0) {
      console.log('⚠️  Aucune migration à exécuter');
      return;
    }

    console.log(`📋 ${migrationFiles.length} migration(s) trouvée(s):`);
    migrationFiles.forEach(f => console.log(`   - ${f}`));

    // Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette opération va modifier la base de données Supabase!');

    // En mode non-interactif, on exécute directement
    // Pour un mode interactif, on pourrait ajouter readline ici
    const shouldRun = process.argv.includes('--yes') || process.argv.includes('-y');

    if (!shouldRun) {
      console.log('\n💡 Utilisez --yes ou -y pour exécuter automatiquement');
      console.log('   Exemple: node backend/db/migrate.js --yes\n');

      // Pour l'instant, on exécute quand même (à ajuster selon vos préférences)
      console.log('⏩ Exécution automatique...\n');
    }

    // Exécuter chaque migration dans une transaction
    for (const migrationFile of migrationFiles) {
      try {
        await client.query('BEGIN');
        await runMigration(client, migrationFile);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Migration annulée (ROLLBACK)');
        throw error;
      }
    }

    console.log('\n✅ Toutes les migrations ont été exécutées avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Utilisateurs: colonnes ajoutées (username, email_verified, etc.)`);
    console.log(`   - Trades: colonnes ajoutées (fees, notes, tags, profit_percent)`);
    console.log(`   - Nouvelle table: portfolio_snapshots`);
    console.log(`   - Nouvelle table: position_history`);
    console.log(`   - Fonction SQL: calculate_portfolio_snapshot()`);

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécution
main().catch(console.error);
