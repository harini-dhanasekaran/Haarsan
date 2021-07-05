//review, rating, createdAt, ref to tour, ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModels.js');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cant be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'A rating must be above 1'],
      max: [5, 'A rating must be below 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const status = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(status);
  if (status.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: status[0].avgRating,
      ratingQuality: status[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingQuality: 0,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//query middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
