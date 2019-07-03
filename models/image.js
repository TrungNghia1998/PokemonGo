var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ImageSchema = new Schema(
    {
        name: { type: String, required: true },
        value: { type: String, required: true },
        contentType: { type: String, required: true }
    }
);

//thuộc tính ảo url
ImageSchema
    .virtual('url')
    .get(function () {
        return '/admin/image/' + this._id;
    })
//Xuất mô hình
module.exports = mongoose.model('Image', ImageSchema);