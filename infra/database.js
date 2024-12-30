import { Client } from "pg";

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client?.end();
  }
}

async function serverVersion() {
  const result = await this.query("SHOW server_version;");

  return result.rows[0].server_version;
}

async function maxConnections() {
  const result = await this.query("SHOW max_connections;");

  return parseInt(result.rows[0].max_connections);
}

async function openedConnections() {
  const result = await this.query({
    text: "SELECT COUNT(*)::int AS num_connections FROM pg_stat_activity WHERE datName = $1;",
    values: [process.env.POSTGRES_DB],
  });

  return result.rows[0].num_connections;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_POST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === "production",
  });

  client.connect();

  return client;
}

const database = {
  query,
  serverVersion,
  maxConnections,
  openedConnections,
  getNewClient,
};

export default database;
