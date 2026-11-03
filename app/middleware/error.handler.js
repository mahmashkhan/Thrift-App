const globalErrorHandler = (err, req, res, next) => {


  console.log(err)
  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.responseCode = "01";
    err.message = `Invalid ID format`;
  }

  // Validation error (Mongoose required fields etc.)
  if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.responseCode = "02";
    err.message = Object.values(err.errors).map(val => val.message).join(", ");
  }

  // Duplicate key error (E11000)
  if (err.code === 11000) {
    err.statusCode = 400;
    err.responseCode = "03";

    const duplicatedField = Object.keys(err.keyValue || {})[0];
    const duplicatedValue = err.keyValue?.[duplicatedField];

    if (duplicatedField && duplicatedValue != null) {
      err.message = `${duplicatedField} already exists`;
    } else {
      err.message = "Duplicate field value entered";
    }
  }

  res.status(err.statusCode || 500).json({
    status: err.status || "fail",
    responseCode: err.responseCode || "01",
    error: err.message || "Internal Server Error",
  });
};

export default globalErrorHandler;
