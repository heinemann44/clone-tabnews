import database from "infra/database.js";
import { ValidationError } from "infra/erros.js";

async function create(userInputValues) {
  await validateEmailDuplicated(userInputValues.email);
  await validateUsernameDuplicated(userInputValues.username);

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

const user = {
  create,
};

export default user;
