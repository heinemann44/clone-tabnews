import session from "models/session.js";
import * as cookie from "cookie";
import {
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/erros";
import user from "models/user";

function onNoMatch(request, response) {
  const publicError = new MethodNotAllowedError();
  response.status(publicError.statusCode).json(publicError);
}

function onError(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }

  const publicError = new InternalServerError({
    cause: error,
  });

  console.error(error);
  response.status(publicError.statusCode).json(publicError);
}

async function setSessionCookie(response, sessionToken) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectUser(request);
  } else {
    injectAnonymous(request);
  }

  return next();

  async function injectUser(request) {
    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userObject = await user.findOneById(sessionObject.user_id);

    request.context = {
      ...request.context,
      user: userObject,
    };
  }

  function injectAnonymous(request) {
    request.context = {
      ...request.context,
      user: {
        features: ["read:activation_token", "create:session", "create:user"],
      },
    };
  }
}

function hasAuthorization(feature) {
  return async function (request, response, next) {
    const user = request.context.user;

    if (user.features.includes(feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Usuário não possui permissão",
      action: "Verifique se esse usuário possui permissão e tente novamente",
    });
  };
}

const controller = {
  errorHandler: {
    onNoMatch: onNoMatch,
    onError: onError,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  hasAuthorization,
};

export default controller;
