export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = "fail";
    this.responseCode = "01";

    Error.captureStackTrace(this, this.constructor);
  }
}
