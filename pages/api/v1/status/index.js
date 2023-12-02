import database from "infra/database.js";

async function status(request, response) {
  const version = await database.serverVersion();
  const maxConnections = await database.maxConnections();
  const openedConnections = await database.openedConnections();

  const updatedAt = new Date().toISOString();

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: maxConnections,
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
