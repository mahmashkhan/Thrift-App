export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = "01";
    this.responseCode = "fail";

    Error.captureStackTrace(this, this.constructor);
  }
}
