const Pool = require('pg').Pool
const pool = new Pool({
  user: 'waltert',
  host: 'localhost',
  database: 'sdc2',
  password: '199405',
  port: 5432,
})


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
  `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    const temp = reviewParsing(results);

    res.status(200).json(Object.values(temp));
  })
}



const getMeta = (req, res) => {
  const {product_id} = req.query;
  var query =
  `
  SELECT
    r.rating,
    r.recommend,
    te.*
  FROM
    reviews_org AS r
  LEFT JOIN
    (SELECT
      co.id AS chara_id,
      co.product_id,
      cr.review_id,
      cr.value,
      co.name
    FROM
      chara_review AS cr
    LEFT JOIN
      charact_org AS co
    ON
      cr.chara_id = co.id
    WHERE
      co.product_id = ${product_id}) AS te
  ON
    r.id = te.review_id
  WHERE
    r.product_id = ${product_id};
  `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    if (results.rows.length === 0) {
      res.status(200).json(results.rows);
    } else {
      const temp = constructMetaData(results);
      const output = metaParsing(temp);
      res.status(200).json(output);
    }

  })
}



module.exports = {
  getReview,
  getMeta,
}


function average(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total+=arr[i];
  }
  return total/arr.length;
}


function metaParsing (temp) {
  var values = Object.values(temp);
  var template = {
    "product_id": values[0].product_id,
    "ratings": {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    "recommended": {
      true: 0,
      false: 0
    },
    "characteristics": {}
  }
  var chara_arr = [];
  values.map(value => {
    // template.product_id = value.product_id;
    template.ratings[value.ratings]++;
    template.recommended[value.recommend]++;
    value.characteristics.map(chara => {
      if (chara_arr.includes(chara[0])) {
        template.characteristics[chara[0]].value.push(chara[1]);
      } else {
        chara_arr.push(chara[0]);
        template.characteristics[chara[0]]={id: chara[2], value: [chara[1]]};
      }
    })
  })
  chara_arr.map(chara => {
    var arr = template.characteristics[chara].value
    template.characteristics[chara].value = average(arr).toFixed(5);
  })

  return template;
}

function constructMetaData (results) {
  var reviewId = [];
  var sendback = {};
  results.rows.map((result) => {
    if (reviewId.includes(result.review_id)) {
      sendback[result.review_id]['characteristics'].push([result.name, result.value, result.chara_id])
    } else {
      reviewId.push(result.review_id);
      var output = {
        product_id: result.product_id,
        ratings: result.rating,
        recommend: result.recommend,
        characteristics: []
      }
      output['characteristics'].push([result.name, result.value, result.chara_id]);
      sendback[result.review_id] = output;
    }
  })

  return sendback;
}


function constructReviewData(result) {
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

function reviewParsing(results) {
  var sendback = {};
  var idArr = [];
  results.rows.map( (result) => {
    if (idArr.includes(result.id)) {
      sendback[result.id]['photos'].push({"url": result.url});
    } else {
      idArr.push(result.id);
      var output =  constructReviewData(result);
      if (result.url != null) {
        output['photos'].push({"url": result.url});
      }
      sendback[result.id] = output;
    }


  })
  return sendback;
}