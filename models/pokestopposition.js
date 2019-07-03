var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PokestopPositionSchema = new Schema(
  {
    name: { type: String, required: true },
    detail: { type: String, required: true },
    xpos: { type: String, required: true },
    ypos: { type: String, required: true },
    image: { type: String, required: false },
    status: { type: Boolean, required: true },
    spinCount: { type: Number, min: 0, required: false }
  }
);

//Router
// PokestopPositionSchema
//   .virtual('image_formatted')
//   .get(function () {
//     return this.image.replace(`&#x2F;`, '\/');
//   })

//Xuất mô hình
module.exports = mongoose.model('PokestopPosition', PokestopPositionSchema);