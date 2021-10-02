const Pool = require('pg').Pool
const pool = new Pool({
  user: 'waltert',
  host: 'localhost',
  database: 'sdc2',
  password: '199405',
  port: 5432,
})

const constructData = (result) => {
  var tempObj = {
    "review_id": result.id,
    "rating": result.rating,
    "summary": result.summary,
    "recommend": result.recommend,
    "response": result.response,
    "body": result.body,
    "date": result._date,
    "reviewer_name": result.reviewer,
    "helpfulness": result.helpful,
    "photos": []
  }
  return tempObj;
}

const dataParsing =  (results) => {
  var sendback = {};
  var idArr = [];
  var output ={
    "review_id": '',
    "rating": '',
    "summary": '',
    "recommend": '',
    "response": '',
    "body": '',
    "date": '',
    "reviewer_name": '',
    "helpfulness": '',
    photos: []
  }
  results.rows.map( (result) => {
    if (idArr.includes(result.id)) {
      // sendback[result.id].photos.push({"url": result.url});
      // sendback[result.id][photos].push({"url": result.url});
      sendback[result.id]['photos'].push({"url": result.url});
    } else {
      idArr.push(result.id);
      var output =  constructData(result);
      if (result.url != null) {
        output['photos'].push({"url": result.url});
      }
      sendback[result.id] = output;
    }


  })

  return sendback;
}


const getReview = (req, res) => {
  const {product_id} = req.query;
  var query =
  `
  SELECT
    ro.*,
    rp.url
  FROM
    reviews_org ro
  LEFT JOIN
    reviewphoto_org rp
  ON
    rp.review_id = ro.id
  WHERE
    product_id = ${product_id};
  `

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    //data parsing
    const temp = dataParsing(results);

    res.status(200).json(Object.values(temp));
  })
}

module.exports = {
  getReview,
}

