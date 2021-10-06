const express = require('express')
const bodyParser = require('body-parser')
const db = require('./queries')
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (req, res) => {
  res.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/reviews', db.getReview);
app.post('/reviews', db.addReview);
app.get('/reviews/meta', db.getMeta);
app.put('/reviews/:review_id/helpful', db.setHelpful);
app.put('/reviews/:review_id/report', db.setReport);


//loader.io
app.get('/loaderio-94a7fda4dcb555e4f2905fbcf0853aff', (req,res) => {
  res.status(200).send('loaderio-94a7fda4dcb555e4f2905fbcf0853aff');
})

app.listen(port, () => {
  console.log(`listening to port: ${port}`);
})

