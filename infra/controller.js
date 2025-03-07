import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "infra/erros";

function onNoMatch(request, response) {
  const publicError = new MethodNotAllowedError();
  response.status(publicError.statusCode).json(publicError);
}

function onError(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

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
