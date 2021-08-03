const express = require('express');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
//to access the route functions i.e the controllers
const tourController = require(`${__dirname}/../controllers/tourControllers`);

//nested router
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)

router
  .route('/:id')
  .get(tourController.getTour)

module.exports = router;
