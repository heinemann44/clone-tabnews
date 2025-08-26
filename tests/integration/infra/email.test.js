import email from "infra/email.js";

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "Remetente <remetente@example.com>",
      to: "destinatario@example.com",
      subject: "Teste assunto",
      text: "Teste corpo",
    });
  });
});
