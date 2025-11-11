import controller from "infra/controller.js";
import { ForbiddenError } from "infra/erros";
import authentication from "models/authentication.js";
import authorization from "models/authorization";
import session from "models/session.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.hasAuthorization("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandler);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const autenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(autenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Usuário não possui permissão para fazer login",
      action: "Entre em contato com o suporte",
    });
  }

  const newSession = await session.create(autenticatedUser.id);

  controller.setSessionCookie(response, newSession.token);

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const sessionExpiredObject = await session.expireById(sessionObject.id);
  await controller.clearSessionCookie(response);

  return response.status(200).json(sessionExpiredObject);
}
