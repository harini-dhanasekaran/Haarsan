const express = require('express');

const router = express.Router();
const viewsController = require(`${__dirname}/../controllers/viewsController`);
const authController = require('../controllers/authControllers');


router.get('/signUp', viewsController.signUp);
router.get('/me', authController.protect, viewsController.getMe);
router.get('/myReview', authController.protect,viewsController.getMyReview);

router.use(authController.isLoggedIn);
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;
