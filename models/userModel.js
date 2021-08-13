const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//name email ,photo ,password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your user name'],
    maxLength: [30, 'A user must have at most 30 characters'],
    minLength: [8, 'A user must have atleast 8 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a email address'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'A password must be at least 8 characters'],
    select: false, // to not show the password when we get users data in postman
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minLength: [8, 'A password must be at least 8 characters'],
    validate: {
      //only works on .save, .create
      validator: function (el) {
        return el === this.password;
      },
      message: 'The password and confirmPassword you entered are not same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//password management

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//instace methods -method that is available for all document in a collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//to check if password was changed within the (90days) expire date of token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //means the password is changed
  }
  //false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 1000 = 1 second so 10 mins = 10*60 seconds
  //console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('user', userSchema);
module.exports = User;
