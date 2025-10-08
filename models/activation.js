import email from "infra/email.js";

async function sendEmailToUser(user) {
  console.log(user.email);

  await email.send({
    from: "Clone tabnews <contato@clonetabnews.com.br>",
    to: user.email,
    subject: "Ative o seu cadastro!",
    text: `Ola ${user.username}, clique no link abaixo para ativar sua conta:\n\nhttp://link...`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
