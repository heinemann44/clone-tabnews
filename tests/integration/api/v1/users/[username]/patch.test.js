import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With username unique", async () => {
      const createdUser = await orchestrator.createUser({
        username: "username.unico1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username.unico2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se esse usuário possui permissão e tente novamente",
        message: "Usuário não possui permissão",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("username not found", async () => {
      const sessionObject = await orchestrator.createDefaultSession();

      const response = await fetch(
        "http://localhost:3000/api/v1/users/usernotfound",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "username.notfound",
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado",
        action: "Verifique se username informado está correto",
        status_code: 404,
      });
    });

    test("Invalid username duplicated", async () => {
      const createUser1 = await orchestrator.createUser({
        username: "username.duplicado1",
      });

      const createUser2 = await orchestrator.createUser({
        username: "username.duplicado2",
      });

      const activatedUser2 = await orchestrator.activateUser(createUser2);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            username: createUser1.username,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado",
        action: "Utilize outro username para realizar esta operação",
        status_code: 400,
      });
    });

    test("Invalid usernameA targeting usernameB", async () => {
      const createUser1 = await orchestrator.createUser({
        username: "username.target.A",
      });

      const createUser2 = await orchestrator.createUser({
        username: "username.target.B",
      });

      const activatedUser2 = await orchestrator.activateUser(createUser2);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            username: createUser1.username,
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário",
        message: "Você nào possui permissão para atualizar outro usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });

    test("user email duplicated", async () => {
      await orchestrator.createUser({
        email: "email.duplicado1@email.com",
      });
      const createUser2 = await orchestrator.createUser({
        email: "email.duplicado2@email.com",
      });

      const activatedUser2 = await orchestrator.activateUser(createUser2);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            email: "email.duplicado1@email.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado",
        action: "Utilize outro email para realizar esta operação",
        status_code: 400,
      });
    });

    test("With username unique", async () => {
      const createdUser = await orchestrator.createUser({
        username: "username.unico1",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "username.unico2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "username.unico2",
        email: createdUser.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With email unique", async () => {
      const createUser = await orchestrator.createUser({
        email: "email.unico1@email.com",
      });

      const activatedUser = await orchestrator.activateUser(createUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "email.unico2@email.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createUser.username,
        email: "email.unico2@email.com",
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const createdUser = await orchestrator.createUser({
        password: "antigasenha",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "novasenha",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userFound = await user.findOneByUsername(createdUser.username);

      const corretMatch = await password.compare(
        "novasenha",
        userFound.password,
      );
      const incorretMatch = await password.compare(
        "antigasenha",
        userFound.password,
      );

      expect(corretMatch).toBe(true);
      expect(incorretMatch).toBe(false);
    });
  });

  describe("Super user", () => {
    test("With super user targeting default user", async () => {
      const superUser = await orchestrator.createUser();
      await orchestrator.activateUser(superUser);
      await orchestrator.addFeaturesToUser(superUser, ["update:user:others"]);
      const superUserSession = await orchestrator.createSession(superUser.id);

      const defaultUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${superUserSession.token}`,
          },
          body: JSON.stringify({
            username: "AlteradoPorSuperUsuario",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "AlteradoPorSuperUsuario",
        email: defaultUser.email,
        password: responseBody.password,
        features: ["read:activation_token"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
