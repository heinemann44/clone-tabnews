import { InternalServerError, MethodNotAllowedError } from "infra/erros";

function onNoMatch(request, response) {
  const publicError = new MethodNotAllowedError();
  response.status(publicError.statusCode).json(publicError);
}

function onError(error, request, response) {
  const publicError = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  console.error(error);
  response.status(publicError.statusCode).json(publicError);
}

const controller = {
  errorHandler: {
    onNoMatch: onNoMatch,
    onError: onError,
  },
};

export default controller;
