const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures.js');

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const docS = await query;
    if (!docS) {
      return next(new AppError(`can't find this document on this server`, 404));
    }
    //Tour.findOne({_id:req.params.id}); in mongoDB0
    res.status(200).json({
      status: 'success',
      data: { docS },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //wait till the end of the query is pas2sed through various features(methods)
    const docA = await features.query; //.explain(); to see query results

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: docA.length,
      data: { docA },
    });
  });
