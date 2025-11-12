const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Optional: logs full error in the console
  
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
  
    // Handle Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError') {
      message = `Resource not found with id: ${err.value}`;
      statusCode = 404;
    }
  
    // Handle Mongoose validation error
    if (err.name === 'ValidationError') {
      message = Object.values(err.errors).map(val => val.message).join(', ');
      statusCode = 400;
    }
  
    // Handle duplicate key errors (e.g., unique fields)
    if (err.code && err.code === 11000) {
      const field = Object.keys(err.keyValue);
      message = `Duplicate field value entered for: ${field}`;
      statusCode = 409;
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Show stack only in dev
    });
  };
  
  export default errorHandler;
  