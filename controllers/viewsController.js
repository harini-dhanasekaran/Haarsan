const Tour = require('../models/tourModels.js');
const Review = require('../models/reviewModel.js');

const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // get the tour data
  const page = req.query.page * 1 || 1;
  const limit = 2;
  const tourTemp = await Tour.find();
  const totalTour = tourTemp.length;
  const tours = await Tour.find()
    .limit(limit * 1)
    .skip((page - 1) * limit);
  //build the templete
  //render that template using tour data obtained
  console.log(`current page =${page}`);
  console.log(`next page =${page + 1}`);
  console.log(`last page = ${Math.ceil((totalTour) / 2)}`);
  console.log(`has prev page= ${page > 1}`);
  console.log(`has next page= ${page * 2 < totalTour}`);
  if(page > Math.ceil((totalTour) / 2)){
    return res.status(400).render('error',{
      title: 'error', 
      msg:'The page doesnot exsits'
    });
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('overview', {
      title: 'All Tours',
      tours: tours,
      currentPage: page,
      hasNextPage: 2 * page < totalTour,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil((totalTour) / 2),
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourS = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tourS) {
    return next(new AppError('The tour doesnot exist', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src https://cdnjs.cloudflare.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tourS.name,
      tour: tourS,
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('account', {
      title: 'My account',
    });
});

exports.getMyReview = catchAsync(async (req, res, next) => {
  const Allreviews = await Review.find();
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('myReviews', {
      title: 'My Reviews',
      reviews: Allreviews,
    });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'Login',
    });
});

exports.signUp = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('signUp', {
      title: 'Sign Up',
    });
});

exports.manageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('manageTours', {
      title: 'Manage Tours',
      tours: tours,
    });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('forgotPassword', {
      title: 'Forgot Password',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!res.locals.user) {
    const { token } = req.query;
    res.status(200).render('resetPassword', {
      title: 'Reset Password',
      token: token,
      email: req.params.email,
    });
  } else {
    res.redirect('/');
  }
});
