const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures.js');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docS = await Model.findByIdAndDelete(req.params.id);
    if (!docS) {
      return next(new AppError(` No document found on this server`, 404));
    }
    res.status(202).json({
      status: 'success',
      message: 'The requested document is deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docS = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //to run the validators in tour schema
    });
    if (!docS) {
      return next(new AppError(`can't find the document on this server`, 404));
    }
    res.status(201).json({
      status: 'success',
      message: { data: docS },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: newDoc,
    });
  });

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
    //calling the call to access the features
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .pagination();

    //wait till the end of the query is pas2sed through various features(methods)
    const docA = await features.query; //.explain(); to see query results

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: docA.length,
      data: { docA },
    });
  });
