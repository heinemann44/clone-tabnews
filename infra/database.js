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

  await client.connect();
  const result = await client.query(queryObject);
  await client.end();

  return result;
}

async function serverVersion() {
  const result = await this.query(
    "SELECT (REGEXP_MATCHES(version(), '\\d+\\.\\d+'))[1] AS postgres_version;",
  );

  return result.rows[0].postgres_version;
}

async function maxConnections() {
  const result = await this.query(
    "SELECT setting::int AS max_connections FROM pg_settings WHERE name = 'max_connections';",
  );

  return result.rows[0].max_connections;
}

async function openedConnections() {
  const result = await this.query(
    "SELECT COUNT(*) AS num_connections FROM pg_stat_activity;",
  );

  return result.rows[0].num_connections;
}

export default {
  query: query,
  serverVersion: serverVersion,
  maxConnections: maxConnections,
  openedConnections: openedConnections,
};
