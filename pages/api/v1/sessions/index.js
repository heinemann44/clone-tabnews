import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const autenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(autenticatedUser.id);

  return response.status(201).json(newSession);
}
