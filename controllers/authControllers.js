const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError');
const Email = require('../utils/email.js');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode,req ,res,) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:req.secure || req.headers['x-forwarded-proto'] === 'https'
  };
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}`;
  await new Email(newUser, url).sendWelcome();
  //header is automatically created
  //JWT token has 3 parts header, payload, signature
  createSendToken(newUser, 201, req,res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exists
  if (!email || !password)
    return next(new AppError('Please provide an email and password', 400));

  // check if user exists and password is correct
  //since password select is set to false it can't be found by findOne so we are adding it explicitly using select
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // 401 = unauthorized
  }

  // if everything is ok , send token to client
  createSendToken(user, 200, req,res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.isLoggedIn = async (req, res, next) => {
  // only for rendered pages and no error should come
  if (req.cookies.jwt) {
    try {
      //to verify the token from the cookie
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //check if the user exists for the given tokens
      // i.e whether the token was provided and within its expire datae(90 days) was the user account deleted.
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      //to check if password of a user changed before the expire of token,
      //then the user has to get a new token with the new password
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //if user is present and has not changed password recently then we have a valid user
      res.locals.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //get the token for the user to verify with our token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  //verify the token got from the user
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user exists for the given tokens
  // i.e whether the token was provided and within its expire datae(90 days) was the user account deleted.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('The user for this token doesnot exist', 401));

  //to check if password of a user changed before the expire of token,
  //then the user has to get a new token with the new password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user recently changed the password! Please login again',
        401
      )
    );
  }

  //grant access to protected routes
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(
      new AppError('You dont have permission to perform this action', 403)
    );
  next();
};

//for password reset

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email provided
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with that email', 404));

  //to get random reset token created as instance in Usermodel
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // since the user doesn't know the password, we have to allow him to change the document in the database without any validation
  //for that we turn off the validators in mongoose, so he can change the password

  // send the mail
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${
      user.email
    }?token=${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'The token was send to the customer mail',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // to save the changes of variables to the database
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on tokens
  // console.log('from auth_controller 😊');
  // console.log(req.query);
  // console.log(req.params.email);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.query.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //console.log(user);
  //2. if token has not expired, then set the new password for the valid users
  if (!user) {
    return next(new AppError('The token is invalid or has expired', 400));
  }

  //3. update the changedPasswordAt property for the user
  //this is done as a middleware in userModel line:68

  //4. log the user in.send JWT to user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({});

  createSendToken(user, 200,req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user from database with the given password
  const user = await User.findById(req.user.id).select('+password');

  //check if current password matches the user entered password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('The current password is incorrect', 401));

  //update the passwords
  //we can't use find and update here as validators and pre middlewares in moongoose will not work
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({});

  //log the user in by sending a new jwt
  createSendToken(user, 200,req, res);
});

//400 =bad request
//401 = unauthorized
//403 = forbidden
//404 = not found
