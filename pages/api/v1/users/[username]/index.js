import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/erros";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.hasAuthorization("update:user"), patchHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
  const userFound = await user.findOneByUsername(request.query.username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const currentUser = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (authorization.cant(currentUser, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você nào possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário",
    });
  }

  const userUpdated = await user.update(username, request.body);
  return response.status(200).json(userUpdated);
}
