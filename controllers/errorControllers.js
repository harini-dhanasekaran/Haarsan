const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
//for development get everything back about the error
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  }
  console.error(err);
  return res.status(err.statusCode).render('error', {
    title: 'error',
    msg: err.message,
  });
};

//if it is in production send only generic error to the client
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    //programming or other errors : not to send to client
    if (!err.isOperational) {
      console.error(err);
      return res.status(500).json({
        status: 'error',
        message: 'Please try again later',
      });
    }

    //trused errors
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Rendered page
  //trused errors
  if (!err.isOperational) {
    console.error(err);
    return res.status(500).render('error', {
      title: 'error',
      msg: 'Please try again later',
    });
  }
  //programming or other errors : not to send to client

  return res.status(err.statusCode).render('error', {
    title: 'error',
    msg: err.message,
  });
};
const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);
const handleJWTExpriredError = () =>
  new AppError('Your token has expired. Please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpriredError(error);
    }
    sendErrorProd(error, req, res);
  }
};
