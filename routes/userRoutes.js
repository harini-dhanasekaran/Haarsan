const express = require('express');

const router = express.Router();
const userController = require(`${__dirname}/../controllers/userControllers`);
const authController = require(`${__dirname}/../controllers/authControllers`);


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:email', authController.resetPassword);

//middleware to check all the below routes are protected
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe',userController.uploadPhoto, userController.resizeUserPhoto ,userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//middleware to allow only the admins to manipulate the user db
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser) //dont try to update password
  .delete(userController.deleteUser);
module.exports = router;
