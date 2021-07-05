const express = require('express');
const authController = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });
const reviewsController = require(`${__dirname}/../controllers/reviewControllers`);

router.use(authController.protect);

router
  .route('/')
  .get(reviewsController.getAllReview)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewsController.setTourUserIds,
    reviewsController.addReview
  );

router
  .route('/:id')
  .get(reviewsController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewsController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewsController.deleteReview
  );
module.exports = router;
