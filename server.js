'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const Url = require('./model/Url');
var dns = require("dns")
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
const Database = require("@replit/database")

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlStatus = 0;

app.post('/api/shorturl/new', async (req, res) => {
  
  let checkUrl = req.body.url.replace(/^https?:\/\//, '');
  // if(dns.lookup(checkUrl, async (err) => {
  //   if(err){
  //     return "error";
  //   }
  // }) === "error"){
  //   console.log(req.body.url);
  //   res.json({ error: 'invalid url' }).end();
  //   return;
  // }

  var regex = /^https?:\/\//; //need this format for res.redirect
  
  if (regex.test(req.body.url)) {
    var tempDnsUrl = req.body.url.slice(req.body.url.indexOf("//") + 2); //need to remove http(s):// to pass to dns.lookup
    var slashIndex = tempDnsUrl.indexOf("/"); //need to remove anythng past .com, etc., for dns.lookup
    var dnsUrl = slashIndex < 0 ? tempDnsUrl : tempDnsUrl.slice(0, slashIndex); 
    console.log("slashIndex: " + slashIndex);
    console.log("dnsUrl: " + dnsUrl);
    dns.lookup(dnsUrl, function(err, address, family) {  //check for valid url
      if (err) { 
        console.log(err); 
        res.send("invalid url");
      }
      else if (address !== undefined) {
        console.log("address: " + address);
        // findOriginalUrl(req.body.url); //check to see if url exists in database
      } 
    });  //dns.lookup
    } else {
    res.send("invalid URL format");
    return ;
  }


  let url = {
    original_url: req.body.url
  }
  let db_url = await Url.findOne(url);
  console.log(db_url);
  if(db_url){
    res.json({
      original_url: db_url.original_url,
      short_url: db_url.short_url
    }).end();
    return;
  }
  urlStatus = urlStatus + 1;
  url['short_url'] = urlStatus;
  console.log(url);
  let save_url = new Url(url); 
  db_url = await save_url.save();
  console.log(db_url);
  res.json({
    original_url: db_url.original_url,
    short_url: db_url.short_url
  }).end();
  return ;
});

app.get('/api/shorturl/:id', async (req, res) => {
  let temp = {short_url: req.params.id};
  console.log(temp);
  try{
    let db_url = await Url.findOne(temp);
    if(db_url){
      // let url = db_url.original_url.replace(/^https?:\/\//, '');
      // url = 'https://'+url;
      res.redirect(302, db_url.original_url);
    }
    else{
      res.json({ error: 'no short json' });
    }
  }
  catch(err){
    res.json({ error: 'no short json' });
  }
})

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});