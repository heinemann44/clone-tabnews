import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator";
import user from "models/user.js";
import session from "models/session";

const emailBaseUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (!response.ok) {
        throw Error();
      }
    }
  }

  async function waitForEmailServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(emailBaseUrl);

      if (!response.ok) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/_.-/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || faker.internet.password(),
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailBaseUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const responseListEmails = await fetch(`${emailBaseUrl}/messages`);
  const listEmails = await responseListEmails.json();
  const lastEmail = listEmails.pop();

  const response = await fetch(
    `${emailBaseUrl}/messages/${lastEmail.id}.plain`,
  );
  const lastEmailBody = await response.text();
  lastEmail.body = lastEmailBody;
  console.log(lastEmail);

  return lastEmail;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
