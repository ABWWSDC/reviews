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
app.get('/reviews/meta', db.getMeta);

app.listen(port, () => {
  console.log(`listening to port: ${port}`);
})

