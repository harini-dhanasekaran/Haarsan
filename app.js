const express = require('express');
const morgan = require('morgan');
const path = require('path');

//used for security of the application
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const cors=require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
//used for error handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');

//to get info about status and routes
const app = express();

app.enable('trust proxy');
//to get access to view for pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//to access all the files in the public folder in a browser
app.use(express.static(path.join(__dirname, 'public')));

//global middleware

//implements cors
app.use(cors());
app.options('*', cors());

//secure http
app.use(helmet());

////middleware for getting additonal information
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // can also use tiny,used to get info about server request.
}

//limiters
const apiLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after an hour',
});
const accountLimiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many accounts created from this IP, please try again after an hour',
});

app.use('/api', apiLimiter);
app.use('/api/v1/users/signup', accountLimiter);

app.use(express.json({ limit: '10kb' })); //used to get body of the reqest body parser, here limit is used to restirct the amount of data that can be send by the user
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//to prevent html parameter parsing
app.use(
  hpp({
    whitelist: [
      'duration',
      'name',
      'duration',
      'difficulty',
      'price',
      'ratingAverage',
      'ratingQuality',
      'maxGroupSize',
    ],
  })
);

app.use(compression());


const viewsRouter = require('./routes/viewsRouter');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//middleware for routing
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewsRouter);

//middleware to catch all other unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//global error handler
app.use(globalErrorHandler);

//to access app  in server file
module.exports = app;
