import database from "infra/database.js";
import { InternalServerError } from "infra/erros";

async function status(request, response) {
  try {
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
  } catch (error) {
    const publicError = new InternalServerError({ cause: error });

    console.error(error);
    response.status(publicError.statusCode).json(publicError);
  }
}

export default status;
