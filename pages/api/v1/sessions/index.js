import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/erros.js";
import { use } from "react";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(request, response) {
  const userInputValues = request.body;

  try {
    const userFound = await user.findOneByEmail(userInputValues.email);

    const passwordMatch = await password.compare(
      userInputValues.password,
      userFound.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Senha incorreta",
        action: "Tente novamente",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Email ou senha incorretos",
      action: "Teste novamente",
    });
  }
  return response.status(201).json({});
}
