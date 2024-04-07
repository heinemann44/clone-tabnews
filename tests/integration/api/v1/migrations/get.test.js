import database from "infra/database.js";

beforeAll(cleanDataBase);

async function cleanDataBase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("GET to /api/v1/migrations shoud return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");

  expect(response.status).toBe(200);
});

test("GET to /api/v1/migrations shoud return a array", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toEqual(true);
});

test("GET to /api/v1/migrations shoud return a array not empty", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");

  const responseBody = await response.json();

  expect(responseBody.length).toBeGreaterThan(0);
});
