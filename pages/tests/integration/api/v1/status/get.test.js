test("GET to /api/v1/status shoud return 200", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/status");

  expect(response.status).toBe(200);
});

test("GET to /api/v1/status shoud return valid updated_at", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/status");

  const responseBody = await response.json();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
});

test("GET to /api/v1/status shoud return database version", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/status");

  const responseBody = await response.json();

  expect(responseBody.dependencies.database.version).toBeDefined();
});

test("GET to /api/v1/status shoud return database max connections", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/status");

  const responseBody = await response.json();

  expect(responseBody.dependencies.database.max_connections).toBeDefined();
});

test("GET to /api/v1/status shoud return database open connections", async () => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/status");

  const responseBody = await response.json();

  expect(responseBody.dependencies.database.opened_connections).toBeDefined();
});
