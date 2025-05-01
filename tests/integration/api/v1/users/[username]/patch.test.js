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
    test("username not found", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usernotfound",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username.duplicado1",
          email: "username.duplicado1@email.com",
          password: "minhasenha",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username.duplicado2",
          email: "username.duplicado2@email.com",
          password: "minhasenha",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username.duplicado2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username.duplicado1",
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

    test("user email duplicated", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email.duplicado1",
          email: "email.duplicado1@email.com",
          password: "minhasenha",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email.duplicado2",
          email: "email.duplicado2@email.com",
          password: "minhasenha",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email.duplicado2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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
      const requestCreateUser = {
        username: "username.unico1",
        email: "username.unico1@email.com",
        password: "minhasenha",
      };

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestCreateUser),
      });

      const requestUpdateUser = {
        username: "username.unico2",
      };

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username.unico1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestUpdateUser),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: requestUpdateUser.username,
        email: requestCreateUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With email unique", async () => {
      const requestCreateUser = {
        username: "email.unico1",
        email: "email.unico1@email.com",
        password: "minhasenha",
      };

      const responseCreate = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestCreateUser),
      });

      expect(responseCreate.status).toBe(201);

      const requestUpdateUser = {
        email: "email.unico2@email.com",
      };

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email.unico1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestUpdateUser),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: requestCreateUser.username,
        email: requestUpdateUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const requestCreateUser = {
        username: "senha.unica1",
        email: "senha.unica1@email.com",
        password: "antigasenha",
      };

      const responseCreate = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestCreateUser),
      });

      expect(responseCreate.status).toBe(201);

      const requestUpdateUser = {
        password: "novasenha",
      };

      const response = await fetch(
        "http://localhost:3000/api/v1/users/senha.unica1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestUpdateUser),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: requestCreateUser.username,
        email: requestCreateUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userFound = await user.findOneByUsername(
        requestCreateUser.username,
      );

      const corretMatch = await password.compare(
        requestUpdateUser.password,
        userFound.password,
      );
      const incorretMatch = await password.compare(
        requestCreateUser.password,
        userFound.password,
      );

      expect(corretMatch).toBe(true);
      expect(incorretMatch).toBe(false);
    });
  });
});
