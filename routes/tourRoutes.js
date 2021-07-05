const express = require('express');
const authController = require('../controllers/authControllers');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
//to access the route functions i.e the controllers
const tourController = require(`${__dirname}/../controllers/tourControllers`);

//nested router
router.use('/:tourId/reviews', reviewRouter);

//router.param('id', tourController.checkID); //moongoose will check this condition
//usual routing calls
router
  .route('/top-5-cheap')
  .get(tourController.cheap, tourController.getAllTours);

router.route('/tour-status').get(tourController.getTourStatus);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.addTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.delTour
  );

module.exports = router;
