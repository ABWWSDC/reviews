
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id int,
  rating int NOT NULL,
  summary VARCHAR,
  recommend VARCHAR,
  response VARCHAR,
  body VARCHAR,
  _date date,
  reviewer_name VARCHAR,
  helpfulness int
);

DROP TABLE IF EXISTS photos;
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  photo_id int,
  url_link VARCHAR,
  review_id int REFERENCES reviews(review_id)
);

DROP TABLE IF EXISTS metadata;
CREATE TABLE metadata (
  id SERIAL PRIMARY KEY,
  product_id int,
  ratings_1 int,
  ratings_2 int,
  ratings_3 int,
  ratings_4 int,
  ratings_5 int,
  recommended int,
  size int,
  width int,
  confort int
);