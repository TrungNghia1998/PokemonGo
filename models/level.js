var mongoose = require('mongoose');
var path = require('path');
var moment = require('moment')
var Schema = mongoose.Schema;

var LevelSchema = new Schema(
  {
    level: { type: Number, required: true, min: 0 },
    xpNext: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }
);

LevelSchema
.virtual('url')
.get(function(){
  return '/admin/level/' + this._id;
})

//Xuất mô hình
module.exports = mongoose.model('Level', LevelSchema);