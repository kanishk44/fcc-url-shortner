

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const mongoose = require('mongoose')
const shortid = require('shortid')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


const { Schema } = mongoose
mongoose.connect(process.env.DB_URI)

const urlSchema = new Schema({
  original_url: String,
  short_url: String
})

const URL = mongoose.model('URL', urlSchema)

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body
  const urlRegex =
    /^(https?:\/\/)?([a-z0-9.-]+)\.([a-z]{2,})(:\d{2,5})?(\/.*)?$/i

  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' })
  }

  const shortCode = shortid.generate()

  const urlObj = new URL({
    original_url: url,
    short_url: shortCode
  })

  try {
    const urlRecord = await urlObj.save()
    console.log(urlRecord)
    res.json(urlRecord)
  } catch (e) {
    console.log(e)
  }
})

app.get('/api/shorturl/:_shorturl', async (req, res) => {
  const shorturl = req.params._shorturl
  console.log(shorturl)
  const urlObj = await URL.findOne({ short_url: shorturl })
  if(!urlObj){
    res.send("URL not found")
  }
  console.log(urlObj)
  const originalURL = urlObj.original_url
  res.redirect(301, originalURL)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
