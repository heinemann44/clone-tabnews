import database from "infra/database.js";
import { UnauthorizedError } from "infra/erros.js";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
      INSERT INTO 
        sessions(token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        *`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneValidByToken(token) {
  const tokenFound = await runSelectSession(token);

  return tokenFound;

  async function runSelectSession(token) {
    const result = await database.query({
      text: `
        select
          *
        from
          sessions
        where
          token = $1
          AND expires_at > NOW()
        limit 1
        ;`,
      values: [token],
    });

    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possiu sessão ativa",
        action: "Verifique se esse usuário está logado e tente novamente",
      });
    }

    return result.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const sessionRenewed = await runUpdateSession(sessionId, expiresAt);

  return sessionRenewed;

  async function runUpdateSession(sessionId, expiresAt) {
    const result = await database.query({
      text: `
        update
          sessions
        set
          expires_at = $1,
          updated_at = timezone('utc', now())
        where
          id = $2
        returning
          *
        ;`,
      values: [expiresAt, sessionId],
    });

    return result.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
