var Pokemon = require('../models/pokemon');
var PokemonPosition = require('../models/pokemonposition');
var Image = require('../models/image');
var async = require('async');
var Bag = require('../models/bag')
var Level = require('../models/level')
var Character = require('../models/character')
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
var moment = require('moment');


// Xử lý tạo vị trí pokémon bằng POST.
exports.pokemonposition_create_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('pokeid').isLength({ min: 1 }).withMessage('Tên Pokestop không hợp lệ.'),
    body('xpos').isLength({ min: 1 }).withMessage('Vĩ độ không hợp lệ.'),
    body('ypos').isLength({ min: 1 }).withMessage('Kinh độ không hợp lệ.'),
    body('timeexist').isLength({ min: 0 }).withMessage('Thời gian tồn tại không hợp lệ.'),
    body('timeappear').isLength({ min: 1 }).withMessage('Thời gian xuất hiện không hợp lệ.'),
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    async (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/pokemons?msg=` + encodeURI(msg));
        }
        else {
            var pokemonposition = new PokemonPosition({
                pokeid: req.body.pokeid,
                xpos: req.body.xpos,
                ypos: req.body.ypos,
                timeexist: req.body.timeexist,
                timeappear: req.body.timeappear == undefined ? new Date() : new Date(req.body.timeappear)
            });
            try {
                //Tạo biến poketype trong bảng Poketype
                transaction.insert('PokemonPosition', pokemonposition);
                //Thực hiện trans
                await transaction.run().then(() => {
                    transaction.clean();
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thả thành công`));

                })
            } catch (error) {
                //Nếu có lỗi thì xuất lỗi, rollback.
                console.error(error);
                transaction.rollback();
                transaction.clean(); //éo phải lỗi ở đây
                res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thả thất bại (DB)`));
            }
        }
    }
]

// Xử lý xóa vị trí pokémon bằng POST.
exports.pokemonposition_delete_post = function (req, res, next) {
    PokemonPosition.findById(req.params.id)
        .exec(async (err, data) => {
            if (err) { return next(err); }
            //Thành công
            try {
                //Nếu k có lỗi thì xóa poketype có _id như results ở trên
                transaction.remove('PokemonPosition', data._id);
                console.log(data._id);
                await transaction.run().then(() => {
                    transaction.clean()
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thu hồi thành công`));
                })
            } catch (error) {
                console.log(error)
                transaction.rollback()
                transaction.clean()
                res.redirect(`/admin/pokemons?msg=` + encodeURI("Thu hồi thất bại (DB)"));
            }
        })
};

// Xử lý cập nhật vị trí pokémon bằng POST.
exports.pokemonposition_update_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('pokeid').isLength({ min: 1 }).withMessage('Tên Pokestop không hợp lệ.'),
    body('xpos').isLength({ min: 1 }).withMessage('Vĩ độ không hợp lệ.'),
    body('ypos').isLength({ min: 1 }).withMessage('Kinh độ không hợp lệ.'),
    body('timeexist').isLength({ min: 0 }).withMessage('Thời gian tồn tại không hợp lệ.'),
    body('timeappear').isLength({ min: 1 }).withMessage('Thời gian xuất hiện không hợp lệ.'),
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    async (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);

        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/pokemons?msg=` + encodeURI(msg));
        }
        else {
            var pokemonposition = new PokemonPosition({
                pokeid: req.body.pokeid,
                xpos: req.body.xpos,
                ypos: req.body.ypos,
                timeexist: req.body.timeexist,
                timeappear: new Date(req.body.timeappear),
                _id: req.params.id
            });
            try {
                //Thực hiện update, bỏ dữ liệu từ poketype1 đã nhập vào 
                transaction.update('PokemonPosition', req.params.id, pokemonposition);
                //Thực hiện trans
                await transaction.run().then(() => {
                    transaction.clean();
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thả thành công`));
                })
            } catch (error) {
                transaction.rollback();
                transaction.clean();
                res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thả thất bại (DB)`));
            }
        }
    }
];

//======================================INGAME=================================


exports.pokemon_catch = [
    sanitizeBody('*').escape(),
    (req, res, next) => {
        var exp = 20;
        var hpMax = 100;
        var hpMin = 50;
        var cpMax = 100;
        var cpMin = 50

        Character.findOne({ accountid: req.user._id }, function (err, character) {
            if (err) { return next(err) }
            async.parallel({
                bag: function (callback) {
                    Bag.findOne({ characterid: character._id }).exec(callback);
                },
                pokemonposition: function (callback) {
                    PokemonPosition.findOne({ _id: req.body.pokemonpositionid }).exec(callback);
                },
                level: function (callback) {
                    Level.find().exec(callback);
                }
            }, async function (err, results) {
                if (err) {
                    res.sendStatus(404)
                    return;
                }
                //VIP ưu tiên
                if (moment(new Date()).diff(character.isVIP, "months") <= 0) {
                    exp += Math.floor(exp * 0.25)
                }
                if (results.bag.pokecur + 1 > results.bag.limit) { //Kiểm tra xem túi đầy chưa
                    res.sendStatus(901);    //mã lỗi túi đầy
                }
                else {
                    //thêm vào túi
                    results.bag.pokebag.push({
                        pokeid: results.pokemonposition.pokeid,
                        level: Math.floor(Math.random() * character.level) + 1,
                        hp: Math.floor(Math.random() * ((hpMax + character.level) - (hpMin + character.level))) + (hpMin + character.level),
                        cp: Math.floor(Math.random() * (cpMax * character.level - cpMin * character.level)) + cpMin * character.level,
                        catchdate: new Date()
                    });
                    //thêm exp
                    var flagLv = false; //kiểm tra xem có lên lv ko
                    if ((character.exp + exp) >= results.level[character.level - 1].xpNext) {
                        character.level++;  //tăng level
                        character.exp = Math.abs((character.exp + exp) - results.level[character.level - 1].xpNext);
                        flagLv = true;
                    }
                    else {
                        character.exp += exp;
                    }
                    //update pokedex
                    if (character.pokedex.indexOf(results.pokemonposition.pokeid) < 0)
                        character.pokedex.push(results.pokemonposition.pokeid);
                    //thêm vào log pokemon position
                    results.pokemonposition.characterlist.push({ characterid: character._id, date: moment(new Date()) });
                    try {
                        transaction.update('Bag', results.bag._id, results.bag);
                        transaction.update('PokemonPosition', req.body.pokemonpositionid, results.pokemonposition)
                        transaction.update('Character', character._id, character)
                        await transaction.run()
                        transaction.clean();
                        var temp = results.bag.pokebag[results.bag.pokebag.length - 1];
                        if (flagLv == true) res.json({ lv: temp.level, cp: temp.cp, hp: temp.hp, exp: exp, levelup: flagLv })
                        else res.json({ lv: temp.level, cp: temp.cp, hp: temp.hp, exp: exp, levelup: flagLv })
                    } catch (err) {
                        res.sendStatus(899);
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            })
        })
    }
]
