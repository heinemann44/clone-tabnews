import { Client, Pool, ClientBase } from "pg";
import { client_encoding } from "pg/lib/defaults";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_POST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
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

export default {
  query: query,
  serverVersion: serverVersion,
  maxConnections: maxConnections,
  openedConnections: openedConnections,
};
