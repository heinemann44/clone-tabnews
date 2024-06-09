import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

test("POST to /api/v1/migrations shoud return 201", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  expect(response.status).toBe(201);
});

test("POST to /api/v1/migrations shoud return a array", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toEqual(true);
});

test("POST to /api/v1/migrations shoud return 200 when there is no migrations to be runned", async () => {
  const responseMigrationRunned = await fetch(
    "http://localhost:3000/api/v1/migrations",
    {
      method: "POST",
    }
  );

  expect(responseMigrationRunned.status).toBe(201);

  const responseMigrationEmpty = await fetch(
    "http://localhost:3000/api/v1/migrations",
    {
      method: "POST",
    }
  );

  expect(responseMigrationEmpty.status).toBe(200);
});
