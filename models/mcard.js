var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MCard = new Schema(
  {
    seri: { type: String, required: true },
    number: { type: String, required: true },
    value: { type: String, required: true },
    status: { type: Boolean, required: true }
  }
);

//Xuất mô hình
module.exports = mongoose.model('MCard', MCard);