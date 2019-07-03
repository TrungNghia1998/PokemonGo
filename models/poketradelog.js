var mongoose = require('mongoose');
var moment = require('moment')
var Schema = mongoose.Schema;

var PokeTradeLogSchema = new Schema(
  {
    characterid: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    pokeid: { type: Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    characterid2: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    pokeid2: { type: Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    date: { type: Date, required: true },
    status: { type: Boolean, required: true, enum: ['true', 'false'], default: 'true' }
  }
);
//Format Url
PokeTradeLogSchema
  .virtual('url')
  .get(function () {
    return '/admin/poketradelog/' + this._id;
  })


//Format date
PokeTradeLogSchema
  .virtual('date_formatted')
  .get(function () {
    return moment(this.date).format('DD/MM/YYYY');
  })

//Format status
PokeTradeLogSchema
  .virtual('status_formatted')
  .get(function () {
    return this.status == true ? 'Thành công' : 'Thất bại';
  })

//Xuất mô hình
module.exports = mongoose.model('PokeTradeLog', PokeTradeLogSchema);