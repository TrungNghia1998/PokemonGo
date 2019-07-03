var mongoose = require('mongoose');
var moment = require('moment')
var Schema = mongoose.Schema;

var PokemonPositionSchema = new Schema(
  {
    pokeid: { type: Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    xpos: { type: String, required: true },
    ypos: { type: String, required: true },
    characterlist: [{
      characterid: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
      date: { type: Date, required: true },
      _id: false
    }],
    timeappear: { type: Date, required: true },
    timeexist: { type: Number, required: true, min: 0 }
  }
);
//Router
PokemonPositionSchema
  .virtual('url')
  .get(function () {
    return '/admin/pokemonposition/' + this._id;
  })

//Format date
PokemonPositionSchema
  .virtual('timeappear_formatted')
  .get(function () {
    return moment(this.timeappear).format('LTS DD/MM/YYYY');
  })

  PokemonPositionSchema
  .virtual('date_formatted')
  .get(function () {
      var temp = [];
      for (var i = 0; i < this.characterlist.length; i++) {
          temp.push(moment(this.characterlist[i].date).format('LTS DD/MM/YYYY'));
      }
      return temp;
  });

//Xuất mô hình
module.exports = mongoose.model('PokemonPosition', PokemonPositionSchema);