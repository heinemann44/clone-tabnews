import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/erros.js";

async function create(userInputValues) {
  await validateEmailDuplicated(userInputValues.email);
  await validateUsernameDuplicated(userInputValues.username);
  await hashPassword(userInputValues);

  const newUser = await runInsertUser(userInputValues);

  return newUser;

  async function validateEmailDuplicated(email) {
    const result = await database.query({
      text: `
        select
          email
        from
          users
        where
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado",
        action: "Utilize outro email para realizar o cadastro",
      });
    }
  }

  async function validateUsernameDuplicated(username) {
    const result = await database.query({
      text: `
        select
          username
        from
          users
        where
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado",
        action: "Utilize outro username para realizar o cadastro",
      });
    }
  }

  async function hashPassword(userInputValues) {
    userInputValues.password = await password.hash(userInputValues.password);
  }

  async function runInsertUser(userInputValues) {
    const result = await database.query({
      text: `
        insert into 
          users (username, email, password)
        values 
          ($1, $2, $3)
        returning 
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectUser(username);

  return userFound;

  async function runSelectUser(username) {
    const result = await database.query({
      text: `
        select
          *
        from
          users
        where
          LOWER(username) = LOWER($1)
        limit 1
        ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado",
        action: "Verifique se username informado está correto",
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
