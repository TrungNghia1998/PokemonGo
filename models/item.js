var mongoose = require('mongoose');
var path = require('path');
var moment = require('moment')

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: { type: String, required: true },
    typeuse: { type: String, enum: ['tool', 'skin', 'vip', 'other', 'packet'], required: true },
    detail: { type: String, required: true },
    image: { type: Schema.Types.ObjectId, ref: 'Image', required: true }
  }
);

ItemSchema
  .virtual('type_formatted')
  .get(function () {
    switch (this.typeuse) {
      case "tool":
        return "Công cụ";
      case "skin":
        return "Thời trang";
      case "vip":
        return "VIP";
      case "other":
        return "Linh tinh";
      default:
        return "Gói";
    }
  });

//Xuất mô hình
module.exports = mongoose.model('Item', ItemSchema);