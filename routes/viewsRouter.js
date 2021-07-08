const express = require('express');

const router = express.Router();
const viewsController = require(`${__dirname}/../controllers/viewsController`);
const authController = require('../controllers/authControllers');

router.get('/signUp', viewsController.signUp);
router.get('/forgotPassword',viewsController.forgotPassword);
router.get('/resetPassword/:email',viewsController.resetPassword);
router.get('/me', authController.protect, viewsController.getMe);
router.get('/myReview', authController.protect,viewsController.getMyReview);
router.get('/manageTours',authController.protect,viewsController.manageTours);

router.use(authController.isLoggedIn);
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;
