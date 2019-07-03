var mongoose = require('mongoose');
var moment = require('moment')

var Schema = mongoose.Schema;

var CharacterSchema = new Schema(
  {
    accountid: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    imageid: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    name: { type: String, required: true, min: 1, max: 15 },
    level: { type: Number, required: true, min: 1, max: 40 },
    exp: { type: Number, required: true, min: 0 },
    gender: { type: Boolean, required: true },
    name: { type: String, required: true },
    createdate: { type: Date, required: true },
    gem: { type: Number, required: true, min: 0 },
    friends: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    clanid: { type: Schema.Types.ObjectId, ref: 'Clan', required: true },
    bagid: { type: Schema.Types.ObjectId, ref: 'Bag', required: true },
    pokestop: [{
      id: { type: Schema.Types.ObjectId, ref: 'PokestopPosition', required: true },
      dateaccess: { type: Date, required: true },
      _id: false
    }],
    xpos: { type: String, required: true },
    ypos: { type: String, required: true },
    isVIP: { type: Date },
    pokedex: [{ type: String,required: false}]
    //Thiếu friends,benefit,pokestop
  }
);

//thuộc tính ảo url admin
CharacterSchema
  .virtual('adminurl')
  .get(function () {
    return '/admin/character/' + this._id;
  })

//thuộc tính ảo url user
CharacterSchema
  .virtual('userurl')
  .get(function () {
    return '/character/' + this._id;
  })

//thuộc tính ảo ngày tạo
CharacterSchema
  .virtual('createdate_formatted')
  .get(function () {
    return moment(this.createdate).format('YYYY-MM-DD HH:mm:ss')
  });

//thuộc tính ảo ngày access pokestop
CharacterSchema
  .virtual('dateaccess_formatted')
  .get(function () {
    var temp = [];
    for (var i = 0; i < this.pokestop.length; i++) {
      temp.push(moment(this.pokestop[i].dateaccess).format('YYYY-MM-DD HH:mm:ss'));
    }
    return temp;
  });

//thuộc tính ảo giới tính
CharacterSchema
  .virtual('gender_formatted')
  .get(function () {
    return this.gender == true ? 'Nam' : 'Nữ';
  });

//thuộc tính ảo ngày vip
CharacterSchema
  .virtual('vip_formatted')
  .get(function () {
    return moment(this.isVIP).format('LTS DD/MM/YYYY')
  });
//Xuất mô hình
module.exports = mongoose.model('Character', CharacterSchema);