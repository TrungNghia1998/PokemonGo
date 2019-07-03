var Character = require('../models/character');
var Bag = require('../models/bag');
var Level = require('../models/level');
var PokemonPosition = require('../models/pokemonposition');
var PokestopPosition = require('../models/pokestopposition');
var Pokemon = require('../models/pokemon');
var Cashshop = require('../models/cashshop');
var moment = require('moment');
var async = require('async')
const Transaction = require('mongoose-transactions');
const transaction = new Transaction();
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//========================================================
//trả về trang ingame
exports.index = function (req, res) {
    Cashshop.find({}, '')
        .populate({ path: 'itemid', populate: { path: 'image' } })
        .exec(function (err, list_cashshops) {
            if (err) { return next(err); }
            console.log('Vào Game');
            //Thành công, render nó
            console.log(list_cashshops[0].itemid.image.value);
            console.log(list_cashshops[1].itemid.image.value);
            console.log(list_cashshops[2].itemid.image.value);
            //console.log(list_cashshops[3].itemid.image.value);
            res.render('ingame/index', { cashshop_list: list_cashshops });
        });
}

// exports.index = function (req, res) {
//     async.parallel({
//         cashshop: function (callback) {
//             Character.findOne({ accountid: req.user._id }).exec(callback);
//         },
//         pokemonposition: function (callback) {
//             PokemonPosition.find()
//                 .populate({ path: 'pokeid', populate: { path: 'image type' } })
//                 .exec(callback);
//         }
//     }, function (err, results) {

//     })
// }

//trả về info nhân vật
exports.character_info = function (req, res, next) {
    Character.findOne({ 'accountid': req.user._id }, (err, data) => {
        if (err) { next(err); }
        else { res.json(data) }
    })
        .populate('imageid')
        .populate('friends')
        .populate({ path: 'bagid', populate: { path: 'items.itemid', populate: { path: 'image' } } })
        .populate({ path: 'bagid', populate: { path: 'pokebag.pokeid', populate: { path: 'image type' } } })
        .populate({ path: 'clanid', populate: { path: 'logo' } })
        .populate('accountid')
}

//trả về level
exports.level = function (req, res, next) {
    Level.find({}, (err, data) => {
        if (err) { next(err); }
        else { res.json(data) }
    })
}

//trả về vị trí pokemon
exports.pokemonLoad = function (req, res, next) {
    async.parallel({
        character: function (callback) {
            Character.findOne({ accountid: req.user._id }).exec(callback);
        },
        pokemonposition: function (callback) {
            PokemonPosition.find()
                .populate({ path: 'pokeid', populate: { path: 'image type' } })
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { next(err) };

        var data = new Array();
        //kiểm tra đã bắt con này chưa
        for (var i = 0; i < results.pokemonposition.length; i++) {
            if (results.pokemonposition[i].characterlist.length == 0) {
                data.push(results.pokemonposition[i])
                continue;
            }
            for (var j = results.pokemonposition[i].characterlist.length - 1; j >= 0; j--) {
                if (results.pokemonposition[i].characterlist[j].characterid.toString() === results.character._id.toString() &&
                    parseInt(moment(results.pokemonposition[i].characterlist[j].date).diff(results.pokemonposition[i].timeappear, 'minutes')) > 0 &&
                    parseInt(moment(new Date()).diff(results.pokemonposition[i].characterlist[j].date, 'minutes')) < results.pokemonposition[i].timeappear) {
                    break;
                }
                data.push(results.pokemonposition[i])
            }
        }
        data = Array.from(new Set(data.map(JSON.stringify))).map(JSON.parse);
        console.log('-------------> Số lượng pokemon load: ' + data.length)
        res.json(data);
    })
}

//trả về vị trí pokestop
exports.pokestopLoad = function (req, res, next) {
    PokestopPosition.find({ status: true }, (err, data) => {
        if (err) { next(err); }
        else { res.json(data) }
    })
}

//trả về cashshop
exports.cashshopLoad = function (req, res, next) {
    Cashshop.find({}, 'itemid price', (err, data) => {
        if (err) { next(err); }
        else { res.json(data) }
    }).populate({ path: 'itemid', populate: { path: 'image' } })
}

//random vị trí xuất hiện pokemon
exports.randomPokemonPosition = function () {
    console.log('================== RESET POKEMON ======================')
    PokemonPosition.find((err, data) => {
        if (err) { return (err); }
        else {
            var nowDate = moment(new Date());
            for (var i = 0; i < data.length; i++) {
                if (nowDate.diff(data[i].timeappear, 'minutes') >= data[i].timeexist) {
                    data[i].xpos = (Math.random() * (11.1602136 - 10.3493704) + 10.3493704).toFixed(6);
                    data[i].ypos = (Math.random() * (107.0265769 - 106.3638784) + 106.3638784).toFixed(6);
                    data[i].timeappear = nowDate;
                    console.log(data[i].pokeid.name + ' đã reset vị trí.')
                    try {
                        transaction.update('PokemonPosition', data[i]._id, data[i]);
                        transaction.run()
                    } catch (err) {
                        transaction.rollback();
                        transaction.clean();
                        throw err;
                    }
                    continue;
                }
            }
            console.log('================== DONE ======================')
        }
    }).populate('pokeid')
}

//set tọa độ nhân vật khi di chuyển
exports.setting_pos_character = function (idchar, xpos, ypos) {
    Character.findOne({ '_id': idchar }, async function (err, data) {
        data.xpos = parseFloat(xpos).toFixed(6);
        data.ypos = parseFloat(ypos).toFixed(6)
        try {
            transaction.update('Character', data._id, data);
            await transaction.run()
            console.log('Lưu vị trí thành công - ' + idchar)
            return;
        } catch (err) {
            res.sendStatus(899);
            transaction.rollback();
            transaction.clean();
        }
    });
}

//Trả về pokemon có trong server
exports.pokemon_server = function (req, res, next) {
    Pokemon.find().populate('image').populate('type').exec((err, data) => {
        if (err) return next(err);
        data.sort(function (a, b) {
            var nameA = a.name.toUpperCase(); // bỏ qua hoa thường
            var nameB = b.name.toUpperCase(); // bỏ qua hoa thường
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // name trùng nhau
            return 0;
        });
        res.json(data);
    });
}

//Trả về lịch sử mua vật phẩm của người chơi
exports.transaction_history = (req, res, next) => {
    Character.findOne({ accountid: req.user._id }).exec((err, character) => {
        if (err) return next(err);
        Cashshop.find().populate({ path: 'itemid', populate: { path: 'image' } }).exec((err, cashshop) => {
            if (err) return next(err);
            let transHistory = new Array();
            cashshop.forEach(item => {
                item.translog.forEach(log => {
                    if (log.characterid.toString() == character._id.toString()) {
                        transHistory.push({ item: item.itemid, amount: log.amount, date: new Date(log.date) })
                    }
                });
            })
            res.json(transHistory);
        });
    })
}