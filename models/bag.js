var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var BagSchema = new Schema(
  {
    characterid: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    limit: { type: Number, required: true, min: 300 },
    items: [{
      itemid: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
      amount: { type: Number, required: true, min: 0, max: 99 },
      _id: false
    }],
    pokebag: [{
      pokeid: { type: Schema.Types.ObjectId, ref: 'Pokemon', required: true },
      level: { type: Number, required: true, min: 1, max: 40 },
      hp: { type: Number, required: true, min: 0 },
      cp: { type: Number, required: true, min: 0 },
      catchdate: { type: Date, required: true },
      _id: false
    }]
  }
);

//thuộc tính ảo url
BagSchema
  .virtual('url')
  .get(function () {
    return '/admin/bag/' + this._id;
  });

//thuộc tính ảo số lượng vật phẩm hiện tại
BagSchema
  .virtual('itemcur')
  .get(function () {
    var temp = 0;
    for (var i = 0; i < this.items.length; i++) {
      temp += this.items[i].amount;
    }
    return temp;
  });

//thuộc tính ảo số lượng pokemon hiện tại
BagSchema
  .virtual('pokecur')
  .get(function () {
    return this.pokebag.length;
  });

//thuộc tính ảo ngày bắt gọn nhẹ
BagSchema
  .virtual('catchdate_formatted')
  .get(function () {
    var temp = [];
    for (var i = 0; i < this.pokebag.length; i++) {
      temp.push(moment(this.pokebag[i].catchdate).format('YYYY-MM-DD'));
    }
    return temp;
  });

//Xuất mô hình
module.exports = mongoose.model('Bag', BagSchema);