class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //fetch the query
    const queryObj = { ...this.queryString };
    const excludedFiles = ['page', 'sort', 'limit', 'fields'];
    excludedFiles.forEach((el) => delete queryObj[el]);

    //advance filtering
    //change the query to mongoDB understandable query by adding $ for operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  //sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(req.query.sort);
      // console.log(req.query.sort.split(','));
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('--createdAt');
    }
    return this;
  }

  //field limiting
  fieldLimit() {
    if (this.queryString.fields) {
      const limit = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(limit);
    } else {
      this.query = this.query.select('-__v'); // add '-' at the beginning to prevent a value from being displayed
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIfeatures;

// const query = Tour.find().where('duration') .equals(5).where('difficulty').equals('easy');
// //fetch the query
// const queryObj = { ...req.query };
// console.log(queryObj);
// const excludedFiles = ['page','sort','limit', 'fields'];
// excludedFiles.forEach((el) => delete queryObj[el]);

// //advance filtering
// //change the query to mongoDB understandable query by adding $ for operators
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
// console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));

//sorting
// if(req.query.sort){
//   const sortBy=req.query.sort.split(',').join(' ');
//   // console.log(req.query.sort);
//   // console.log(req.query.sort.split(','));
//   // console.log(sortBy);
//   query =query.sort(sortBy);
// }
// else{
//   query=query.sort('--createdAt');
// }

// //field limiting
// if(req.query.fields){
//   const limit=req.query.fields.split(',').join(' ');
//   query = query.select(limit);
// }else{
//   query= query.select('-__v'); // add '-' at the beginning to prevent a value from being displayed
// }

//paginations
// const page=req.query.page*1 || 1;
// const limit=req.query.limit*1 || 10;
// const skip=(page-1)*limit;
// query=query.skip(skip).limit(limit);

// if(req.query.page){
//   const numTours=await Tour.countDocuments();
//   if(skip>=numTours)throw new Error('This page doesnot exits');
// }
