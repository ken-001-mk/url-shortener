require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlParser = require('url');

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db("shortener_db")
const urls = db.collection("short")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  console.log(req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlParser.parse(url).hostname,
  async (err, address) => {
    if (!address){
      res.json({ error: 'Invalid URL'})
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url: req.body.url,
        short_url: urlCount
      }

      const results = await urls.insertOne(urlDoc)
      console.log(results)
      res.json({ original_url: req.body.url, short_url: urlCount})
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({short_url: +shorturl})
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
