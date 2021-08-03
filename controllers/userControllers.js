const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const factory = require('./handleFactory');



//memoryStorage is used to store in buffer volatile

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};
const upload = multer({ storage: multer.memoryStorage(), fileFilter: multerFilter });

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if(!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowed) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowed.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        `this route is not for updating password, user /updateMyPassword`,
        401
      )
    );
  }
  //fileter unwanted body values(field names),filterObj is userdefined function
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  //find the user for DB and return the new user after update and run validation, filterdBody has the changes to be made fields
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

