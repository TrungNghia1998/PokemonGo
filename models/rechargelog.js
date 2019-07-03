var mongoose = require('mongoose');
var moment = require('moment')
var numeral = require('numeral');
var Schema = mongoose.Schema;

var RechargeLogSchema = new Schema(
  {
    accountid: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    method: { type: String, required: true, enum: ["MCARD", "PAYPAL", "BRAINTREE"] },
    paymentid: { type: String },
    status: { type: Boolean, required: true }
  }
);

//Format url
RechargeLogSchema
  .virtual('url')
  .get(function () {
    return '/admin/rechargelog/' + this._id;
  })

//Format status
RechargeLogSchema
  .virtual('status_formatted')
  .get(function () {
    return this.status == true ? 'Thành công' : 'Thất bại';
  })

//Format amount
RechargeLogSchema
  .virtual('amount_formatted')
  .get(function () {
    return numeral(this.amount).format('0,0') + ' VNĐ';
  })

//Format date
RechargeLogSchema
  .virtual('date_formatted')
  .get(function () {
    return moment(this.date).format('HH:mm:ss DD/MM/YYYY');
  })

//Xuất mô hình
module.exports = mongoose.model('RechargeLog', RechargeLogSchema);