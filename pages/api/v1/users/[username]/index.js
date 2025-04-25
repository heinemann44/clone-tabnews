import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
  const userFound = await user.findOneByUsername(request.query.username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const userUpdated = await user.update(request.query.username, request.body);
  return response.status(200).json(userUpdated);
}
