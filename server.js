/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

//to get environment variables access in config.env file
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION,Shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

// to connect to our database either locally or in atlas cloud
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    //FOR CONNECTING LOCAL SERVER
    //.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection established 😃');
  });

//everything related to starting a server
const app = require('./app');

//start server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App is running on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION,Shutting down 🌋');
  server.close(() => {
    process.exit(1);
  });
});

//web RTC, socketIO with express
