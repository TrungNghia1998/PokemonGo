var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ClanSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: Schema.Types.ObjectId, ref: 'Image', required: true }
  }
);

//thuộc tính ảo url
ClanSchema
  .virtual('url')
  .get(function () {
    return '/admin/clan/' + this._id;
  })
//Xuất mô hình
module.exports = mongoose.model('Clan', ClanSchema);