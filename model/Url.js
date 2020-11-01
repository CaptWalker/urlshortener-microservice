const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UrlSchema = new Schema({
  original_url: {
    type: String
  },
  short_url: Number
});

module.exports = Url = mongoose.model('url', UrlSchema);