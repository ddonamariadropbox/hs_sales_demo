var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = new Schema({
 name: {type: String, required: true},
 logo: {data: Buffer, contentType: String}
});

schema.virtual('url').get(function(){
  return '/' + this.name;
});

module.exports = mongoose.model('Customer', schema);
