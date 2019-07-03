var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AccountSchema = new Schema(
  {
    fullname: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    username: { type: String, required: true },
    password: { type: String, required: true },
    cash: { type: Number, required: true, min: 0 },
    createdate: { type: Date, required: true },
    exchangelog: [{
      amount: { type: Number, required: true, min: 0 },
      date: { type: Date, required: true },
      _id: false
    }],
    acctype: { type: Boolean, required: true },
    status: { type: Boolean, required: true },
    characterid: { type: Schema.Types.ObjectId, ref: 'Character', required: false }
  }
);

//Thuộc tính ảo URL cho admin
AccountSchema
  .virtual('adminurl')
  .get(function () {
    return '/admin/account/' + this._id;
  })

//Thuộc tính ảo URL cho user
AccountSchema
  .virtual('userurl')
  .get(function () {
    return '/account/' + this._id;
  })

//Chỉnh ngày giờ cho nó gọn 
AccountSchema
  .virtual('createdate_formatted')
  .get(function () {
    return moment(this.createdate).format('HH:mm:ss  DD-MM-YYYY');
  });

//acctype - true: admin, false: user
AccountSchema
  .virtual('acctype_formatted')
  .get(function () {
    return this.acctype == true ? 'GM' : 'Người chơi'
  })

//status - true: đang hoạt động, false: bị khóa
AccountSchema
  .virtual('status_formatted')
  .get(function () {
    return this.status == true ? "<span class=\"label label-success\">Đang hoạt động</span>" : '<span class=\"label label-danger\">Bị khóa</span>'
  })

//Xuất mô hình
module.exports = mongoose.model('Account', AccountSchema);