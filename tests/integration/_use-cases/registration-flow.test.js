import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  test("Create user account", async () => {
    const createdUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "RegistrationFlow@email.com",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createdUserResponse.status).toBe(201);

    const createdUserResponseBody = await createdUserResponse.json();

    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      username: "RegistrationFlow",
      email: "RegistrationFlow@email.com",
      features: ["read:activation_token"],
      password: createdUserResponseBody.password,
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@clonetabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<RegistrationFlow@email.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro!");
    expect(lastEmail.body).toContain("RegistrationFlow");
  });

  test("Activation account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
