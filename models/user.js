import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/erros.js";
import password from "models/password.js";

async function create(userInputValues) {
  await validateUsernameDuplicated(userInputValues.username);
  await validateEmailDuplicated(userInputValues.email);
  await hashPassword(userInputValues);

  const newUser = await runInsertUser(userInputValues);

  return newUser;

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
      action: "Utilize outro username para realizar esta operação",
    });
  }
}

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
      action: "Utilize outro email para realizar esta operação",
    });
  }
}

async function hashPassword(userInputValues) {
  userInputValues.password = await password.hash(userInputValues.password);
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

async function findOneByEmail(email) {
  const userFound = await runSelectUser(email);

  return userFound;

  async function runSelectUser(email) {
    const result = await database.query({
      text: `
        select
          *
        from
          users
        where
          LOWER(email) = LOWER($1)
        limit 1
        ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado",
        action: "Verifique se email informado está correto",
      });
    }

    return result.rows[0];
  }
}

async function update(username, userInputValues) {
  const userFound = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUsernameDuplicated(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateEmailDuplicated(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPassword(userInputValues);
  }

  const userUpdatedValues = {
    ...userFound,
    ...userInputValues,
  };

  const updatedUser = await runUpdateUser(userUpdatedValues);

  return updatedUser;

  async function runUpdateUser(userUpdateValues) {
    const result = await database.query({
      text: `
        update
          users 
        set
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('utc', now())
        where
          id = $4
        returning 
          *
        ;`,
      values: [
        userUpdateValues.username,
        userUpdateValues.email,
        userUpdateValues.password,
        userUpdateValues.id,
      ],
    });

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
