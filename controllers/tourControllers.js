/* eslint-disable prettier/prettier */
//const fs = require('fs');
//to read the file that has json data about tours
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const Tour = require('../models/tourModels.js');
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./handleFactory');

//route handlers
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);




