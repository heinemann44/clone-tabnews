import database from "infra/database";
import email from "infra/email.js";
import { NotFoundError } from "infra/erros";
import webserver from "infra/weserver";
import user from "./user";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 15; // 15 min
async function sendEmailToUser(user, activationToken) {
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

async function findOneValidByToken(tokenId) {
  const tokenFound = await runSelectActivationToken(tokenId);

  return tokenFound;

  async function runSelectActivationToken(tokenId) {
    const result = await database.query({
      text: `
        select
          *
        from
          user_activation_tokens
        where
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        limit 1
        ;`,
      values: [tokenId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O token de ativação não foi encontrado ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return result.rows[0];
  }
}

async function markTokenAsUsed(tokenId) {
  const usedToken = await runUpdateQuery(tokenId);

  return usedToken;

  async function runUpdateQuery(tokenId) {
    const result = await database.query({
      text: `
        update
          user_activation_tokens
        set
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        where
          id = $1
        returning
          *
        ;`,
      values: [tokenId],
    });

    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  return await user.setFeatures(userId, ["create:session", "read:session"]);
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidByToken,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
