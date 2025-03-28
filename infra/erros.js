class CustomerError extends Error {
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends CustomerError {
  constructor({ cause, statusCode }) {
    super("Erro interno não esperado", { cause });
    this.name = "InternalServerErros";
    this.action = "Entre em contato com o suporte";
    this.statusCode = statusCode || 500;
  }
}

export class ServiceError extends CustomerError {
  constructor({ cause, message }) {
    super(message || "Serviço indisponível no momento", { cause });
    this.name = "ServiceError";
    this.action = "Verifique o serviço e tente novamente";
    this.statusCode = 503;
  }
}

export class ValidationError extends CustomerError {
  constructor({ cause, message, action }) {
    super(message || "Dados inválidos", { cause });
    this.name = "ValidationError";
    this.action = action || "Verifique os dados e tente novamente";
    this.statusCode = 400;
  }
}

export class NotFoundError extends CustomerError {
  constructor({ cause, message, action }) {
    super(message || "Não foi possível encontrar este recurso no sistema", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action || "Verifique se os parâmetros informados estão corretos";
    this.statusCode = 404;
  }
}

export class MethodNotAllowedError extends CustomerError {
  constructor() {
    super("Método não permitido para este endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Verifique o método HTTP enviado";
    this.statusCode = 405;
  }
}
