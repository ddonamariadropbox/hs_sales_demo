var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = new Schema({
 name: {type: String, required: true},
 logo: String,
 primary_color: String,
 secondary_color: String,
 api_app: String,
 template: String
});

schema.virtual('url').get(function(){
  return '/' + this.name;
});

module.exports = mongoose.model('Customer', schema);
