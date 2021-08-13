const express = require('express');
const authController = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });
const reviewsController = require(`${__dirname}/../controllers/reviewControllers`);

router.use(authController.protect);

router
  .route('/')
  .get(reviewsController.getAllReview)

router
  .route('/:id')
  .get(reviewsController.getReview)
module.exports = router;
