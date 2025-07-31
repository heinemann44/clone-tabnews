import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/user", () => {
  describe("Default user", () => {
    test("With a valid session", async () => {
      const userCreated = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(userCreated.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: userCreated.id,
        username: "UserWithValidSession",
        email: userCreated.email,
        password: userCreated.password,
        created_at: userCreated.created_at.toISOString(),
        updated_at: userCreated.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
  });
});
