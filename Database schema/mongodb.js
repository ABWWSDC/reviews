const reviewsSchema = new Schema (
  [{
  'review_id':'<Object_id>',
  "product_id":int,
  'rating':int,
  "summary": string,
  "recommend": bool,
  "response": string,
  "body": string,
  "date": date,
  "reviewer_name": string,
  "helpfulness": int,
  "photos":[{
    "id":'<Object_id>',
    "url":string
  }]
}]
);

const metaSchema = new Schema ({
  "product_id":'<Object_id>',
  "ratings":{
    '0':int
    '1':int,
    '2':int,
    '3':int,
    '4':int,
    '5':int
  },
  "characteristics": {
    "Size": {
      "id": int,
      "value": int
    },
    "Width": {
      "id": int,
      "value": int
    },
    "Comfort": {
      "id": int,
      "value": int
    },
}]