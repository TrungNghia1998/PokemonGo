var Bag = require('../models/bag');
var Item = require('../models/item');
var Pokemon = require('../models/pokemon');
var Character = require('../models/character');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()

//Hiển thị danh sách tất cả túi.
exports.bag_list = function (req, res, next) {
    Bag.find({}, 'characterid limit items pokebag')
        .populate('characterid')
        .populate('items.itemid')
        .populate('pokebag.pokeid')
        .exec(function (err, list_bags) {
            if (err) { return next(err); }
            console.log(list_bags[0].characterid.name);
            console.log(list_bags[0].pokebag.length);
            console.log(list_bags[0].items[0].itemid.name);
            res.render('admin/bag_list', { title: 'Danh sách túi nhân vật', bag_list: list_bags });
        });
};
//Load detail lên modal
exports.loadBagDetail = function (req, res) {
    var id = req.body.id;
    Account.findById({ _id: id }, function (err, bag) {
        if (err) throw err;
        //Success
        res.status(200).json({ data: bag, status: true });
    })
};

//Load Bag
//Load data
exports.loadBagData = function (req, res) {
    Bag.find({}, 'characterid limit items pokebag')
        .populate('characterid')
        .populate('items.itemid')
        .populate('pokebag.pokeid')
        .exec(function (err, list_bags) {
            if (err) { return next(err); }
            console.log(list_bags);
            //res.render('admin/bag_list', { title: 'Danh sách túi nhân vật', bag_list: list_bags });
            res.status(200).json({ title: 'Danh sách túi nhân vật', bag_list: list_bags });
        });
}

// Hiển thị thông tin chi tiết túi.
exports.bag_detail = function (req, res, next) {
    async.parallel({
        bag: function (callback) {
            Bag.findById(req.params.id)
                .populate('items.itemid')
                .populate('pokebag.pokeid')
                .populate('characterid')
                .exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.bag == null) {  //túi không tồn tại
            var err = new Error('Không tìm thấy túi');
            err.startus = 404;
            return next(err);
        }
        //Tìm thấy tài khoản, triển ngay
        res.render('admin/bag_detail', { title: 'Chi tiết túi', bag: results.bag });
    });
};

// Hiển thị form xóa túi bằng GET.
exports.bag_delete_get = function (req, res, next) {
    res.render('admin/bag_use', { title: 'Dùng vật phẩm/Vứt Pokemon test' });
};

// Xử lý dùng (vứt) vật phẩm bằng POST.
//tham số: 
//req.body.idx: id item
//req.body.type: loại item vứt (0: item, 1: pokemon)
//req.body.amount: số lượng vứt (chỉ áp dụng cho items)
exports.bag_delete_post = [
    sanitizeBody('*').escape(),
    (req, res, next) => {
        Character.findOne({ 'accountid': req.user._id }, function (err, data) {
            if (err) { next(err) }
            async.parallel({
                bag: function (callback) {
                    Bag.findOne({ characterid: data._id })
                        .exec(callback);
                }
            }, async function (err, results) {
                if (req.body.type == '0') {
                    for (var i = 0; i < results.bag.items.length; i++) {
                        if (results.bag.items[i].itemid.toString() === req.body.idx) {
                            //nếu số lượng dùng nhiều hơn số lượng hiện có
                            if (results.bag.items[i].amount < parseInt(req.body.amount)) {
                                res.status(909).send({ status: '909' }) //Lỗi số lượng ko đúng
                                return;
                            }
                            //nếu số lượng dùng bằng số lượng hiện có
                            if (results.bag.items[i].amount == parseInt(req.body.amount)) {
                                results.bag.items.splice(i, 1);
                                try {
                                    transaction.update('Bag', results.bag._id, results.bag);
                                    await transaction.run()
                                    res.status(200).send({ status: '200' });    //thành công
                                    return;
                                } catch (err) {
                                    res.status(899).send({ status: '899' })
                                    transaction.rollback();
                                    transaction.clean();
                                }
                            }
                            //nếu số lượng dùng bé hơn số lượng hiện có
                            if (results.bag.items[i].amount > parseInt(req.body.amount)) {
                                results.bag.items[i].amount -= parseInt(req.body.amount);

                                try {
                                    transaction.update('Bag', results.bag._id, results.bag);
                                    await transaction.run()
                                    res.status(200).send({ status: '200' });
                                    return;
                                } catch (err) {
                                    res.status(899).send({ status: '899' })
                                    transaction.rollback();
                                    transaction.clean();
                                }
                            }
                        }
                    }
                }

                else {
                    for (var i = 0; i < results.bag.pokebag.length; i++) {
                        var moment = require('moment');
                        if (moment(results.bag.pokebag[i].catchdate).format("DD:MM:YYYY:hh:mm:ss") == req.body.idx) {
                            results.bag.pokebag.splice(i, 1);
                            try {
                                transaction.update('Bag', results.bag._id, results.bag);
                                await transaction.run()
                                res.status(200).send({ status: '200' });
                            } catch (err) {
                                res.status(899).send({ status: '899' })
                                transaction.rollback();
                                transaction.clean();
                            }
                            break;
                        }
                    }
                }
            })
        })
    }
]

// Hiển thị cập nhật túi bằng GET cho admin.
exports.bag_update_get_admin = function (req, res, next) {
    //lấy túi
    async.parallel({
        bag: function (callback) {
            Bag.findById(req.params.id)
                // .polulate('characterid')
                .populate('characterid items.itemid pokebag.pokeid')
                .exec(callback);
        },
        items: function (callback) {
            Item.find({})
                .exec(callback);
        },
        pokemons: function (callback) {
            Pokemon.find({})
                .exec(callback)
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        if (results.bag == null) {  //túi ko tồn tại
            var err = new Error('Túi không tồn tại');
            err.status = 404;
            return next(err);
        }
        //Thành công
        res.render('admin/bag_form', { title: 'Cập nhật túi', bag: results.bag, items: results.items, pokemons: results.pokemons });
    })
};

//thêm vật phẩm 
exports.bag_add_post = [
    //Check "sạch"
    sanitizeBody('*').escape(),
    async (req, res, next) => {
        var characterid;
        await Character.findOne({ 'accountid': req.user._id }, function (err, data) {
            characterid = data._id;
        });
        //lấy thông tin túi
        async.series({
            bag: function (callback) {
                Bag.findOne({ characterid: characterid })
                    .exec(callback);
            },
            items: function (callback) {
                Item.find({})
                    .exec(callback);
            },
        }, async function (err, results) {
            if (err) { return next(err); }
            //Kiểm tra xem túi đầy chưa
            if (results.bag.itemcur + parseInt(req.body.amount) > results.bag.limit) //Kiểm tra xem túi đầy chưa
            {
                res.sendStatus(901);
            }
            else {
                //túi chưa đầy
                var flag = false;
                var n = results.bag.items.length;
                //kiểm tra xem vật phẩm tồn tại chưa
                for (var i = 0; i < n; i++) {
                    if (results.bag.items[i].itemid.toString() == req.body.item) {
                        flag = true;
                        results.bag.items[i].amount = parseInt(results.bag.items[i].amount) + parseInt(req.body.amount);
                        try {
                            transaction.update('Bag', results.bag._id, result.bag);
                            await transaction.run()
                            res.sendStatus(200);
                            return;
                        } catch (err) {
                            res.sendStatus(899);
                            transaction.rollback();
                            transaction.clean();
                        }
                    }
                }
                if (flag == false) {
                    results.bag.items.push({ itemid: req.body.item, amount: req.body.amount });
                    try {
                        transaction.update('Bag', results.bag._id, result.bag);
                        await transaction.run()
                        res.sendStatus(200);
                        return;
                    } catch (err) {
                        res.sendStatus(899);
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            }
        })
    }
];

// Xử lý cập nhật túi bằng POST cho admin.
exports.bag_update_post_admin = [
    sanitizeBody('*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
            //Trả lại dữ liệu bag
            var err = new Error('Thông tin nhập vào có lỗi');
            err.status = 404;
            return next(err);
        }
        else {
            //lấy thông tin túi
            async.parallel({
                bag: function (callback) {
                    Bag.findById(req.params.id)
                        .exec(callback);
                }
            }, async function (err, results) {
                if (err) { return next(err); }
                //Kiểm tra xem túi đầy chưa
                var itemcur = 0;
                for (var i = 0; i < req.body.limit; i++) {
                    itemcur += parseInt(req.body.amount[i]);
                }
                if (itemcur > results.bag.limit || req.body.pokemon.length > results.limit) //Kiểm tra xem túi đầy chưa
                {
                    var err = new Error('Túi đầy');
                    console.log(err);
                    err.status = 500;
                    return next(err);
                }
                else {
                    //túi chưa đầy
                    //nếu add là vật phẩm
                    var items = new Array();
                    var pokebag = new Array();
                    for (var i = 0; i < req.body.item.length; i++) {
                        items.push({ itemid: req.body.item[i], amount: req.body.amount[i] });
                    }
                    for (var i = 0; i < req.body.pokemon.length; i++) {
                        pokebag.push({ pokeid: req.body.pokemon[i], level: req.body.level[i], hp: req.body.hp[i], cp: req.body.cp[i], catchdate: req.body.catchdate[i] });
                    }
                    results.bag.limit = req.body.limit;
                    results.bag.items = items;
                    results.bag.pokebag = pokebag;
                    try {
                        transaction.update('Bag', results.bag._id, result.bag);
                        await transaction.run()
                        res.redirect(results.bag.url + '/update');
                        return;
                    } catch (err) {
                        err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                        res.render('admin/bag_form', { title: 'Cập nhật túi', bag: results.bag, items: results.items, pokemons: results.pokemons });
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            })
        }
    }
]