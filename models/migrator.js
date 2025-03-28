import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

async function listPendingMigrations() {
  return await executeMigrationRunner(true);
}

async function runPendingMigrations() {
  return await executeMigrationRunner(false);
}

async function executeMigrationRunner(dryRun) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationsConfig = {
      dbClient: dbClient,
      dryRun: dryRun,
      dir: resolve("infra", "migrations"),
      direction: "up",
      log: () => {},
      migrationsTable: "pgmigrations",
    };

    return await migrationRunner(defaultMigrationsConfig);
  } finally {
    await dbClient.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
