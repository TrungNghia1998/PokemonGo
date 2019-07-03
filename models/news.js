var mongoose = require('mongoose');
var moment = require('moment')
var Schema = mongoose.Schema;

var NewsSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, required: true },
        typenews: { type: String, required: true, enum: ['Sự kiện', 'Tin tức', 'Hướng dẫn', 'Khuyến mãi'], default: 'Tin tức' }
    }
);

//Format date theo kiểu VN
NewsSchema
    .virtual('createdate_formatted')
    .get(function () {
        return moment(this.date).format('DD/MM/YYYY');
    });

//Thuộc tính ảo cho các URL theo loại
NewsSchema
.virtual('url')
.get(function(){
  return '/admin/news/' + this._id;
});
NewsSchema
.virtual('homeurl')
.get(function(){
  return '/news/' + this._id;
});



function change_alias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "-");
    str = str.replace(/ + /g, "-");
    str = str.trim();
    return str;
}

//Xuất mô hình
module.exports = mongoose.model('News', NewsSchema);