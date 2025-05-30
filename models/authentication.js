import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/erros.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const userFound = await findUserByEmail(providedEmail);
    await validateUserPassword(providedPassword, userFound.password);
    return userFound;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Email ou senha incorretos",
        action: "Teste novamente",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    try {
      return await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email incorreto",
          action: "Tente novamente",
        });
      }

      throw error;
    }
  }

  async function validateUserPassword(providedPassword, storedPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Senha incorreta",
        action: "Tente novamente",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
