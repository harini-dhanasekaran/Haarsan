/* eslint-disable prettier/prettier */
//const fs = require('fs');
//to read the file that has json data about tours
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const Tour = require('../models/tourModels.js');
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./handleFactory');

//The CRUD operations of mongoose is done
exports.cheap = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,difficulty,summary';
  next();
};

//route handlers
exports.delTour = factory.deleteOne(Tour);
exports.addTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);


exports.getTourStatus = catchAsync(async (req, res, next) => {
  //use of aggregate functions
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 3 } },
    },
    {
      $group: {
        _id: '$difficulty', //change this to change based on what sort should occur
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuality' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, // DB limit functionality
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});


