class AppError extends Error{
    constructor(message,statusCode){
        super(message); // the Erro consturctor will assign the message prop to message. so no need to specifiy it using this.message = message
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4')?'fail':'error'; // fail for operational error
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports = AppError;