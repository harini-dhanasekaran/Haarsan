const Review = require('../models/reviewModel');
const factory = require('./handleFactory');

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.setTourUserIds = function (req, res, next) {
  //when the tour and user id is not provided by the user then we take the following as default
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
