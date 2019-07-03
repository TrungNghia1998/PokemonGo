var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ExpActionSchema = new Schema(
  {
    action: { type: String, required: true },
    value: { type: Number, required: true, min: 0 }
  }
);

//Xuất mô hình
module.exports = mongoose.model('ExpAction', ExpActionSchema);