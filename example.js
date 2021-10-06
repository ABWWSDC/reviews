create table reviews (
	id serial primary key,
	product_id int not null,
	rating int not null,
	_date bigint,
	summary varchar,
	body varchar,
	recommend bool,
	reported bool,
	reviewer_name varchar,
	reviewer_email varchar,
	response int not null,
	helpfulness int not null

)



-- CREATE TABLE reviews (
  -- 	id serial primary key,
  -- 	product_id int not null,
  -- 	_date bigint,
  -- 	summary varchar,
  -- 	body varchar,
  -- 	recommend bool,
  -- 	reviewer varchar,
  -- 	report bool,
  -- 	email varchar,
  -- 	response varchar,
  -- 	helpful int,
  -- )

  --set serial
-- CREATE SEQUENCE my_serial_2 AS integer START 5774953 OWNED BY testing_review.id;

-- ALTER TABLE testing_review ALTER COLUMN id SET DEFAULT nextval('my_serial_2');

CREATE INDEX  rc_cid ON review_chara(chara_id);
CREATE INDEX  cc_id ON chara_char(id);
CREATE INDEX  cc_pid ON chara_char(product_id);
CREATE INDEX  r_id ON reviews(id);
CREATE INDEX  rc_rid ON review_chara(review_id);
CREATE INDEX  r_pid ON reviews(product_id);
CREATE INDEX  rp_rid ON review_photo(review_id);