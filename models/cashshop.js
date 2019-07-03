var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var CashshopSchema = new Schema(
    {
        itemid: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
        price: { type: Number, required: true, min: 0 },
        startdate: { type: Date, required: true },
        translog: [{
            characterid: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
            amount: { type: Number, required: true, min: 1 },
            date: { type: Date, required: true },
            _id: false
        }]
    }
);

//thuộc tính ảo url admin
CashshopSchema
    .virtual('adminurl')
    .get(function () {
        return '/admin/cashshop/' + this._id;
    })

//thuộc tính ảo url user
CashshopSchema
    .virtual('userurl')
    .get(function () {
        return '/cashshop/' + this._id + '/buy';
    })

//thuộc tính ảo ngày bắt đầu bán gọn nhẹ
CashshopSchema
    .virtual('startdate_formatted')
    .get(function () {
        return moment(this.startdate).format('YYYY-MM-DD HH:mm:ss');
    });

//thuộc tính ảo ngày bán gọn nhẹ
CashshopSchema
    .virtual('date_formatted')
    .get(function () {
        var temp = [];
        for (var i = 0; i < this.translog.length; i++) {
            temp.push(moment(this.translog[i].date).format('YYYY-MM-DD HH:mm:ss'));
        }
        return temp;
    });

//thuộc tính ảo thêm đơn vị tiền tệ trong game
CashshopSchema
    .virtual('price_currency')
    .get(function () {
        return this.price + ' gem';
    })
//Xuất mô hình
module.exports = mongoose.model('Cashshop', CashshopSchema);