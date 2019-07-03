var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PokemonSchema = new Schema(
  {
    type: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    name: { type: String, required: true },
    detail: { type: String, required: true },
    image: { type: Schema.Types.ObjectId, ref: 'Image', required: true }
    //Kiểu của image
  }
);

PokemonSchema
  .virtual('url')
  .get(function () {
    return '/admin/pokemon/' + this._id;
  })

//Xuất mô hình
module.exports = mongoose.model('Pokemon', PokemonSchema);