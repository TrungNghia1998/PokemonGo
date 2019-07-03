var PokeTradeLog = require('../models/poketradelog');
var Pokemon = require('../models/pokemon');
var Character = require('../models/character');
var async = require('async')
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
//Hiển thị danh sách tất cả lịch sử giao dịch Pokémon.
exports.poketradelog_list = function (req, res) {
    PokeTradeLog.find({}, 'characterid pokeid characsterid2 pokeid2 date status')
        .populate('characterid')
        .populate('characterid2')
        .populate('pokeid')
        .populate('pokeid2')
        .exec(function (err, list_poketradelog) {
            if (err) { return next(err); }
            console.log(list_poketradelog);
            res.render('admin/poketradelog_list', { title: 'Danh sách bản ghi Pokemon đã trao đổi', poketradelog_list: list_poketradelog });
        });
};

// Hiển thị thông tin chi tiết lịch sử giao dịch Pokémon.
exports.poketradelog_detail = function (req, res) {
    async.parallel({
        poketradelog: function (callback) {
            PokeTradeLog.findById(req.params.id)
                .populate('characterid')
                .populate('characterid2')
                .populate('pokeid')
                .populate('pokeid2')
                .exec(callback);
        }
    }, function (err, result) {
        if (err) { return next(err); }
        if (result.poketradelog == null) {
            var err = new Error('Không có Pokestop nào');
            err.status = 404;
            return next(err);
        }
        res.render('admin/poketradelog_detail', { title: 'Chi tiết Pokemon Trade', poketradelog: result.poketradelog });

    })
};

// Hiển thị form tạo lịch sử giao dịch Pokémon bằng GET.
exports.poketradelog_create_get = function (req, res) {
    async.parallel({
        pokemons: function (callback) {
            Pokemon.find()
                .exec(callback);
        },
        character: function (callback) {
            Character.find()
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('admin/poketradelog_form', { title: 'Tạo pokemon', pokemons: results.pokemons, characters: results.character });
    })
};

// Xử lý tạo lịch sử giao dịch Pokémon bằng POST.
exports.poketradelog_create_post = [
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            async.parallel({
                pokemons: function (callback) {
                    Pokemon.find()
                        .exec(callback);
                },
                character: function (callback) {
                    Character.find()
                        .exec(callback);
                }
            }, function (err, results) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/pokemon_form', { title: 'Tạo Pokemon', character: results.character, pokemons: results.pokemons, errors: error.array() });
            })
        }
        else {
            //Dữ liệu hợp lệ
            //Kiểm tra xem tài khoản tồn tại chưa
            async.parallel({
            }, async function (err, results) {
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var poketrade = new PokeTradeLog({
                    characterid: req.body.poketradechar,
                    pokeid: req.body.poketradepokeid,
                    characterid2: req.body.poketradechar2,
                    pokeid2: req.body.poketradepokeid2,
                    date: req.body.poketradedate,
                    status: req.body.poketradestatus
                });
                try {
                    //Tạo biến poketype trong bảng Poketype
                    transaction.insert('PokeTradeLog', poketrade);
                    //Thực hiện trans
                    await transaction.run();
                    res.redirect('/admin/poketradelogs');
                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    console.error(error);
                    transaction.rollback().catch(console.error);
                    transaction.clean(); //éo phải lỗi ở đây
                    res.render('admin/poketrade_form', { title: 'Tạo giao dịch', poketrade: req.body });
                }
            }
            )
        }
    }  
];

// Hiển thị form xóa lịch sử giao dịch Pokémon bằng GET.
exports.poketradelog_delete_get = function (req, res) {
    res.render('admin/poketype_delete', { title: 'Xóa vật phẩm', poketype: results.poketype });
};

// Xử lý xóa lịch sử giao dịch Pokémon bằng POST.
exports.poketradelog_delete_post = function (req, res) {
    async.parallel({
        poketrade: function (callback) {
            PokeTradeLog.findById(req.body.poketradeid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        else {
            try {
                //Nếu k có lỗi thì xóa poketype có _id như results ở trên
                transaction.remove('PokeTradeLog', results.poketrade._id);
                await transaction.run();
                res.redirect('/admin/poketradelogs')
            } catch (error) {
                console.error(error)
                transaction.rollback().catch(console.error)
                transaction.clean()
                res.render('admin/poketrade_delete', { title: 'Xóa giao dịch', poketrade: req.body })
            }
        }
    })
};

// Hiển thị cập nhật lịch sử giao dịch Pokémon bằng GET.
exports.poketradelog_update_get = function (req, res) {
    async.parallel({
        pokemons: function (callback) {
            Pokemon.find()
                .exec(callback);
        },
        character: function (callback) {
            Character.find()
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('admin/poketradelog_form', { title: 'Tạo pokemon', pokemons: results.pokemons, characters: results.character });
    })
};

// Xử lý cập nhật lịch sử giao dịch Pokémon bằng POST.
exports.poketradelog_update_post = [
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            async.parallel({
                pokemons: function (callback) {
                    Pokemon.find()
                        .exec(callback);
                },
                character: function (callback) {
                    Character.find()
                        .exec(callback);
                }
            }, function (err, results) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/pokemon_form', { title: 'Tạo Pokemon', character: results.character, pokemons: results.pokemons, errors: error.array() });
            })
        }
        else {
            //Dữ liệu hợp lệ
            //Kiểm tra xem tài khoản tồn tại chưa
            async.parallel({
            }, async function (err, results) {
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var poketrade1 = new PokeTradeLog({
                    characterid: req.body.poketradechar,
                    pokeid: req.body.poketradepokeid,
                    characterid2: req.body.poketradechar2,
                    pokeid2: req.body.poketradepokeid2,
                    date: req.body.poketradedate,
                    status: req.body.poketradestatus,
                    _id: results.poketrade._id
                });
                try {
                    //Tạo biến poketype trong bảng Poketype
                    transaction.update('Pokemon', results.poketrade._id, poketrade1);
                    //Thực hiện trans
                    await transaction.run();
                    res.redirect('/admin/poketradelogs');
                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    console.error(error);
                    transaction.rollback().catch(console.error);
                    transaction.clean(); //éo phải lỗi ở đây
                    res.render('admin/poketrade_form', { title: 'Tạo giao dịch', poketrade: req.body });
                }
            }
            )
        }
    }  
];