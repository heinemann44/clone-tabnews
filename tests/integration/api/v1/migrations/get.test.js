import orchestrator from "tests/orchestrator.js";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseBody)).toEqual(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
