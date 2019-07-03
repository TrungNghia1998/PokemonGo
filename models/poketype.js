var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PoketypeSchema = new Schema(
  {    
    name: { type: String, required: true },
    image: { type: String, required: true }
  }
);

//Format url
PoketypeSchema
.virtual('url')
.get(function(){
  return '/admin/poketype/' + this._id;
})

//Xuất mô hình
module.exports = mongoose.model('Poketype', PoketypeSchema);