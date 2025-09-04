import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "Remetente <remetente@example.com>",
      to: "destinatario@example.com",
      subject: "Teste assunto",
      text: "Teste corpo",
    });

    await email.send({
      from: "Remetente <remetente@example.com>",
      to: "destinatario@example.com",
      subject: "Assunto último email",
      text: "Corpo último email",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<remetente@example.com>");
    expect(lastEmail.recipients[0]).toBe("<destinatario@example.com>");
    expect(lastEmail.subject).toBe("Assunto último email");
    expect(lastEmail.body).toBe("Corpo último email\r\n");
  });
});
