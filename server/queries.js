const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ubuntu',
  host: 'ec2-18-217-151-64.us-east-2.compute.amazonaws.com',
  database: 'SDC',
  password: 'ubuntu',
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
    reviews ro
  LEFT JOIN
    review_photo rp
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
    reviews AS r
  LEFT JOIN
    (SELECT
      co.id AS chara_id,
      co.product_id,
      cr.review_id,
      cr.value,
      co.name
    FROM
      review_chara AS cr
    LEFT JOIN
      chara_char AS co
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


const setHelpful = (req, res) => {
  const {review_id} = req.params;
  var query =
  `
  UPDATE
    reviews
  SET
    helpfulness = helpfulness+1
  where
    id=${review_id};
  `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    res.status(204).json('updated');
  })
}

const setReport = (req, res) => {
  const {review_id} = req.params;
  var query =
  `
  UPDATE
    reviews
  SET
    reported = true
  where
    id=${review_id};
  `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    res.status(204).json('reported');
  })
}

const addReview = (req, res) => {
  var {
    product_id,
    rating,
    summary,
    body,
    recommend,
    name,
    email,
    photos,
    characteristics
  } = req.body;
  var reviewQuery =`
  INSERT INTO
    reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, helpfulness, reported, response)
  VALUES
    (
      ${product_id},
      ${rating},
      '${summary}',
      '${body}',
      ${recommend},
      '${name}',
      '${email}',
      0,
      false,
      'null');
  `;
  var photoQuery = photoQueryConstruct(photos);
  var charaQuery = charaQueryConstruct(characteristics);
  pool.query(reviewQuery, (error, results) => {
    if (error) {
      throw error
    }
    pool.query(photoQuery, (error, results) => {
      if (error) {
        throw error
      }
      pool.query(charaQuery, (error, results) => {
        if (error) {
          throw error
        }
        res.status(204).json('review submited');
      })
    })
  })
}




module.exports = {
  getReview,
  getMeta,
  setHelpful,
  setReport,
  addReview
}

function photoQueryConstruct (arr) {
  var str = 'INSERT INTO review_photo (review_id, url) VALUES ';
  // var str = 'INSERT INTO reviewphoto_org (review_id, url) VALUES ';
  for (var i = 0; i < arr.length; i++) {
    str += `((SELECT MAX (id) from reviews), '${arr[i]}'),`;
  }
  str = str.slice(0,-1);
  return str;
};

function charaQueryConstruct (obj) {
  var str = 'INSERT INTO review_chara (chara_id, review_id, value) VALUES '
  for (var key in obj) {
    str += `(${Number(key)}, (SELECT MAX (id) from reviews), ${obj[key]}),`;
  }
  str = str.slice(0,-1);
  return str;
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
    "reviewer_name": result.reviewer_name,
    "helpfulness": result.helpfulness,
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


