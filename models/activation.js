import database from "infra/database";
import email from "infra/email.js";
import webserver from "infra/weserver";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 15; // 15 min
async function sendEmailToUser(user, activationToken) {
  console.log(user.email);

  await email.send({
    from: "Clone tabnews <contato@clonetabnews.com.br>",
    to: user.email,
    subject: "Ative o seu cadastro!",
    text: `Ola ${user.username}, clique no link abaixo para ativar sua conta:\n\n${webserver.origin}/cadastro/ativar/${activationToken.id}`,
  });
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(userId, expiresAt);

  return newSession;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
      INSERT INTO 
        user_activation_tokens(user_id, expires_at)
      VALUES
        ($1, $2)
      RETURNING
        *`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findByUserId(userId) {
  const tokenFound = await runSelectActivationToken(userId);

  return tokenFound;

  async function runSelectActivationToken(userId) {
    const result = await database.query({
      text: `
        select
          *
        from
          user_activation_tokens
        where
          user_id = $1
        limit 1
        ;`,
      values: [userId],
    });

    return result.rows[0];
  }
}

const activation = {
  sendEmailToUser,
  create,
  findByUserId,
};

export default activation;
