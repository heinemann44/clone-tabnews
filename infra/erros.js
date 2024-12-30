export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Erro interno não esperado", { cause });
    this.name = "InternalServerErros";
    this.action = "Entre em contato com o suporte";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
