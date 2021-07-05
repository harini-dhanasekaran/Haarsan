const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
//data validation(data given to us to updata the database is in correct format) and sanitization(no malicious code)
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //built-in data validators
      maxLength: [40, 'A tour name must have less or equal than 40 characters'], //built-in data validators
      minLength: [10, 'A tour name must have more or equal than 10 characters'], //built-in data validators
      unique: true, //not a validator
      trim: true,
      //validate:[validator.isAlpha,'Tour name must have only characters'] 3rd party validator
    },
    slug: { type: String },
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    location: { type: String, required: [true, 'A tour must have a location'] },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'A tour must have a difficulty of easy, medium, difficulty',
      }, //built-in data validators (only for strings)
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'A rating must be above 1.0'],
      max: [5.0, 'A rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuality: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this does not validate for updates. 'this' only points at the new document that is created.
        validator: function (val) {
          return val < this.price;
        },
        message: 'The tour Discount is more the tour price',
      },
    },
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secret: { type: Boolean, default: false, select: false },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// document middleware

//this function is called whenever we .save or .create a tour in our db and not for insert,findOne,findMany
//pre is executed before the document, this parameter point to the document
//we have used .create in addtour in tourcontrollers
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//query middleware /find/ is regular expression so that all find methods can be included
//to create secret tour
//have skipped 1 function

tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires',
  });
  next();
});

//aggregate middleware

tourSchema.pre('aggreate', function (next) {
  this.pipeline.unshift({ $match: { secret: { $ne: true } } });
  next();
});

// can also use post which has access to both doc and next.
//it is executed after all the pre hooks/middleware
// tourSchema.post('save', (doc , next) => {
//   console.log(doc);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

//we call a function (method) on the  new document itself
// const testTour1 = new Tour({
//   name: 'The Forest Hicker',
//   rating: 4.7,
//   price: 497,
// });

// testTour1
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR:', err);
//   });

// startLocation: {
//   //GeoJson
//   type: {
//     type: String,
//     default: 'Point',
//     enum: ['Point'],
//   },
//   coordinates: [Number],
//   address: String,
//   description: String,
// },
// locations: [
//   {
//     type: {
//       type: String,
//       default: 'Point',
//       enum: ['Point'],
//     },
//     coordiantes: [Number],
//     address: { type: String },
//     description: { type: String },
//     day: { type: Number },
//   },
// ],
