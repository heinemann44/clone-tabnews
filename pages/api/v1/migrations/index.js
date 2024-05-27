import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  // Test
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationsConfig = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationsConfig);

      await dbClient.end();

      return response.status(200).json(pendingMigrations);
    } else if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsConfig,
        dryRun: false,
      });

      await dbClient.end();

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }

    return response.status(405);
  } catch (error) {
    console.error(error);
  } finally {
    await dbClient.end();
  }
}
