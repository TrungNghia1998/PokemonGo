var PokestopPosition = require('../models/pokestopposition');
var Bag = require('../models/bag')
var Character = require('../models/character')
var Item = require('../models/item')
var Level = require('../models/level')
var async = require('async');
var moment = require('moment')
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()

//Hiển thị danh sách tất cả vị trí PokéStop.
exports.pokestopposition_list = function (req, res, next) {
    let msg = req.query.msg == undefined ? 'Pokéstop và hơn thế nữa' : req.query.msg;
    PokestopPosition.find()
        .exec(function (err, list_pokestopposition) {
            if (err) { return next(err); }
            res.render('admin/pokestop_list', {
                title: 'Quản lý Pokéstop | Admin - MiddleField',
                name: req.user.username,
                pokestop_list: list_pokestopposition,
                msg: msg
            });
        });
};

// Xử lý tạo vị trí PokéStop bằng POST.
exports.pokestopposition_create_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('name').isLength({ min: 1 }).withMessage('Tên Pokemon Stop không hợp lệ'),
    body('xpos').isLength({ min: 1 }).isDecimal().withMessage('Vĩ độ không hợp lệ'),
    body('ypos').isLength({ min: 1 }).isDecimal().withMessage('Kinh độ không hợp lệ'),
    body('status').isBoolean().withMessage('Trạng thái không hợp lệ'),
    body('image').isLength({ min: 1 }).isURL().withMessage('Địa chỉ ảnh nền không hợp lệ'),
    //Dữ liệu sạch
    sanitizeBody('name').escape(),
    sanitizeBody('xpos').escape(),
    sanitizeBody('ypos').escape(),
    sanitizeBody('status').escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/pokestops?msg=` + encodeURI(msg));
        } else {
            //Dữ liệu hợp lệ
            //Kiểm tra tồn tại chưa            
            PokestopPosition.findOne({ 'xpos': req.body.xpos, 'ypos': req.body.ypos, name: req.body.name })
                .exec(async function (err, found_pokestop) {
                    if (err) { return next(err); }
                    if (found_pokestop) {
                        //Vật phẩm đã tồn tại, chuyển về trang chi tiết vật phẩm đó
                        res.redirect(`/admin/pokestops?msg=` + encodeURI(`Pokéstop ${req.body.name} đã tồn tại`));
                    }
                    //Nếu k trùng, k lỗi thì tạo thôi
                    else {
                        var pokestopposition = new PokestopPosition({
                            name: req.body.name,
                            detail: req.body.detail,
                            xpos: req.body.xpos,
                            ypos: req.body.ypos,
                            image: req.body.image,
                            spinCount: 0,
                            status: true
                        });
                        try {
                            //Tạo biến poketype trong bảng Poketype
                            transaction.insert('PokestopPosition', pokestopposition);
                            //Thực hiện trans
                            await transaction.run().then(() => {
                                transaction.clean();
                                res.redirect(`/admin/pokestops?msg=` + encodeURI(`Đặt pokéstop ${req.body.name} thành công`));
                            });
                        } catch (error) {
                            //Nếu có lỗi thì xuất lỗi, rollback.
                            transaction.rollback()
                            transaction.clean();
                            res.redirect(`/admin/pokestops?msg=` + encodeURI(`Đặt pokéstop ${req.body.name} thất bại (DB)`));
                        }
                    }
                });
        }
    }
];

// Xử lý lock vị trí PokéStop bằng POST.
exports.pokestopposition_lock_post = function (req, res) {
    PokestopPosition.findById(req.params.id).exec(async (err, data) => {
        if (err) { return next(err); }
        //Thành công
        data.status = false;
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.update('PokestopPosition', req.params.id, data);
            await transaction.run().then(() => {
                transaction.clean();
                res.redirect(`/admin/pokestops?msg=` + encodeURI(`Khóa pokéstop ${data.name} thành công`));
            });
        } catch (error) {
            console.log(error)
            transaction.rollback();
            transaction.clean();
            res.redirect(`/admin/pokestops?msg=` + encodeURI(`Khóa pokéstop ${data.name} thất bại (DB)`));
        }
    })
};

// Xử lý xóa vị trí PokéStop bằng POST.
exports.pokestopposition_unlock_post = function (req, res) {
    PokestopPosition.findById(req.params.id).exec(async (err, data) => {
        if (err) { return next(err); }
        //Thành công
        data.status = true;
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.update('PokestopPosition', req.params.id, data);
            await transaction.run().then(() => {
                transaction.clean();
                res.redirect(`/admin/pokestops?msg=` + encodeURI(`Mở khóa pokéstop ${data.name} thành công`));
            });
        } catch (error) {
            transaction.rollback();
            transaction.clean();
            res.redirect(`/admin/pokestops?msg=` + encodeURI(`Mở khóa pokéstop ${data.name} thất bại (DB)`));
        }
    })
};

// Xử lý cập nhật vị trí PokéStop bằng POST.
exports.pokestopposition_update_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('name').isLength({ min: 1 }).withMessage('Tên Pokemon Stop không hợp lệ'),
    body('xpos').isLength({ min: 1 }).isDecimal().withMessage('Vĩ độ không hợp lệ'),
    body('ypos').isLength({ min: 1 }).isDecimal().withMessage('Kinh độ không hợp lệ'),
    body('status').isBoolean().withMessage('Trạng thái không hợp lệ'),
    body('image').isLength({ min: 1 }).isURL().withMessage('Địa chỉ ảnh nền không hợp lệ'),
    //Dữ liệu sạch
    sanitizeBody('name').escape(),
    sanitizeBody('xpos').escape(),
    sanitizeBody('ypos').escape(),
    sanitizeBody('status').escape(),
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/pokestops?msg=` + encodeURI(msg));
        } else {
            async.parallel({
                pokestop: function (callback) {
                    //req.params là lấy trên thanh truy cập
                    PokestopPosition.findById(req.params.id).exec(callback);
                }

            }, async function (err, results) {
                if (err) { return next(err); }
                else {
                    var pokestop = new PokestopPosition({
                        name: req.body.name,
                        detail: req.body.detail,
                        xpos: req.body.xpos,
                        ypos: req.body.ypos,
                        image: req.body.image,
                        status: req.body.status,
                        _id: results.pokestop._id
                    });

                    try {
                        //Thực hiện update, bỏ dữ liệu từ poketype1 đã nhập vào 
                        transaction.update('PokestopPosition', results.pokestop._id, pokestop);
                        //Thực hiện trans
                        await transaction.run().then(() => {
                            transaction.clean();
                            res.redirect(`/admin/pokestops?msg=` + encodeURI(`Cập nhật pokéstop ${req.body.name} thành công`));
                        });
                    } catch (error) {
                        transaction.rollback()
                        transaction.clean();
                        res.redirect(`/admin/pokestops?msg=` + encodeURI(`Cập nhật pokéstop ${req.body.name} thất bại (DB)`));
                    }
                }

            })
        }
    }
];


//====================================INGAME=================================
exports.spin_pokestop = [
    sanitizeBody('*').escape(),
    (req, res, next) => {
        Character.findOne({ accountid: req.user._id }, function (err, character) {
            if (err) { return next(err) }
            //Triển thôi
            async.parallel({
                bag: function (callback) {
                    Bag.findOne({ characterid: character._id }).exec(callback);
                },
                pokestopposition: function (callback) {
                    PokestopPosition.findOne({ _id: req.body.pokestoppositionid }).exec(callback);
                },
                items: function (callback) {
                    Item.find()
                        .populate('image').exec(callback);
                },
                level: function (callback) {
                    Level.find().exec(callback);
                }
            }, async function (err, results) {
                if (err) {
                    res.sendStatus(404);
                    return;
                }
                if (results.pokestopposition.status == false) {
                    res.status(200).send({ status: '000' });
                    return;
                }
                results.pokestopposition.spinCount++;
                //kiểm tra đã quay chưa chưa
                var timeReset = 5;  //thời gian reset (phút)
                var nowDate = moment(new Date());
                for (var i = 0; i < character.pokestop.length; i++) {
                    if (character.pokestop[i].id.toString() == req.body.pokestoppositionid.toString() &&
                        parseInt(nowDate.diff(character.pokestop[i].dateaccess, 'minutes')) <= timeReset) {
                        res.status(200).send({ status: '999' });
                        return;
                    }
                }

                //Triển thôi
                var itemsContain = new Array();    //mảng chứa
                var itemsComp = ['Bóng thường', 'Bóng tinh anh', 'Bóng siêu cấp', 'Bóng tối thượng'];   //item muốn rớt vào

                //thêm vào danh sách item sẽ rớt ra kèm ngẫu nhiên số lượng
                for (var i = 0; i < results.items.length; i++) {
                    if (itemsComp.indexOf(results.items[i].name.trim()) != -1) {
                        itemsContain.push({ item: results.items[i], amount: 0 });
                    }
                }
                //random số lượng vật phẩm rớt ra trong mảng chứa (có thể ra hết luôn)
                var itemDropRate = Math.random() * 100;
                if (itemDropRate < 1)  // 0%
                    var numItemDrop = 4;
                else if (itemDropRate < 3)     // 1-2%
                    var numItemDrop = 3
                else if (itemDropRate < 50) // 3-49%
                    var numItemDrop = 2;
                else   //50-99%
                    var numItemDrop = 1;
                //random chọn vật phẩm nào sẽ rớt ra trong mảng chứa
                var itemsDrop = new Array();
                for (var i = 0; i < numItemDrop; i++) {
                    var rateElement = Math.random() * 100;
                    if (rateElement < (0 + character.level - 30))  // 1~9%
                        var elementNum = 3;
                    else if (rateElement < (10 + character.level - 30))     // 9~19%
                        var elementNum = 2
                    else if (rateElement < (20 + character.level) - 30) // 10~39%
                        var elementNum = 1;
                    else   //70~110%
                        var elementNum = 0;

                    //random số lượng rớt theo item
                    var rate = Math.random() * 100;
                    if (rate < 5)  // 0-4%
                        var amount = 4;
                    else if (rate < 10)     // 5-9%
                        var amount = 3
                    else if (rate < 50) // 10-49%
                        var amount = 2;
                    else   //49-99%
                        var amount = 1;
                    if (itemsDrop.indexOf(itemsContain[elementNum]) != -1) {    //check tồn tại
                        itemsDrop[itemsDrop.indexOf(itemsContain[elementNum])].amount += amount;
                    }
                    else {
                        itemsDrop.push(itemsContain[elementNum]);
                        itemsDrop[itemsDrop.indexOf(itemsContain[elementNum])].amount += amount;
                    }
                }

                //check exp (nếu pokestop đã từng quay r thì + 10, chưa thì +20)

                function checkEXP() {
                    let exp = 5;
                    if (character.pokestop.length == 0) {
                        exp = 10;
                        character.pokestop.push({ id: req.body.pokestoppositionid, dateaccess: moment(new Date()) })
                    } else {
                        let index = character.pokestop.findIndex(p => { return p.id.toString() === req.body.pokestoppositionid });
                        if (index < 0) {
                            exp = 10;
                            character.pokestop.push({ id: req.body.pokestoppositionid, dateaccess: moment(new Date()) })
                        }
                        else
                            character.pokestop[index].dateaccess = moment(new Date());
                    }
                    //VIP ưu tiên
                    if (moment(new Date()).diff(character.isVIP, "months") <= 0 && moment(new Date()).diff(character.isVIP, "days") < 0) {
                        exp += Math.floor(exp * 0.25)
                    }
                    return exp;
                }
                var exp = await checkEXP();
                //tìm tổng số lượng itme sẽ thêm vào
                function sumItem() {
                    var temp = 0;
                    for (var i = 0; i < itemsDrop.length; i++) {
                        temp += parseInt(itemsDrop[i].amount);
                    }
                    return temp;
                }

                //thêm exp
                var flagLv = false; //kiểm tra xem có lên lv ko
                if ((character.exp + exp) >= results.level[character.level - 1].xpNext) {
                    // console.log(results.level[parseInt(character.level - 1)].xpNext)
                    character.level++;  //tăng level
                    character.exp = (character.exp + exp) - results.level[character.level - 2].xpNext;
                    flagLv = true;
                }
                else {
                    character.exp += exp;
                }

                //check xem túi đầy chưa (nếu đầy thì chỉ nhận exp mà ko nhận item)
                if (results.bag.itemcur + await sumItem() > results.bag.limit) {
                    try {
                        transaction.update('Character', character._id, character);
                        transaction.update('PokestopPosition', results.pokestopposition._id, results.pokestopposition);
                        await transaction.run().then(() => {
                            transaction.clean();
                            if (flagLv == true) {
                                res.status(200).send({ exp: exp, status: '903' }) //lên level + quay thành công - túi đầy
                            } else {
                                res.status(200).send({ exp: exp, status: '901' });
                            }   //quay thành công - được exp mà ko lên cấp - túi đầy
                        })
                    } catch (err) {
                        res.status(899).send({ status: '899' });
                        transaction.rollback();
                        transaction.clean();
                    }
                } else {
                    //thêm item vào túi.
                    //kiểm tra xem vật phẩm tồn tại chưa
                    //Cờ kiểm tra vật phẩm có trong túi chưa
                    var flag = false;
                    for (var j = 0; j < itemsDrop.length; j++) {
                        for (var i = 0; i < results.bag.items.length; i++) {
                            if (results.bag.items[i].itemid.toString() == itemsDrop[j].item._id.toString()) {
                                flag = true;
                                results.bag.items[i].amount = parseInt(results.bag.items[i].amount) + parseInt(itemsDrop[j].amount);
                                break;
                            }
                        }
                        if (flag == false) {
                            results.bag.items.push({ itemid: itemsDrop[j].item._id, amount: itemsDrop[j].amount });
                            break;
                        }
                    }

                    try {
                        transaction.update('Character', character._id, character);
                        transaction.update('Bag', results.bag._id, results.bag)
                        transaction.update('PokestopPosition', results.pokestopposition._id, results.pokestopposition);

                        await transaction.run().then(() => {
                            transaction.clean();
                            if (flagLv == true) {
                                itemsDrop.push({ exp: exp, levelup: true })
                                res.status(200).json(itemsDrop)

                            } else { //lên level + quay thành công - túi ko đầy
                                itemsDrop.push({ exp: exp, levelup: false })
                                res.status(200).json(itemsDrop);   //quay thành công - được exp mà ko lên cấp - túi ko đầy
                            }
                        })

                    } catch (err) {
                        res.status(899).send({ status: '899' });
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            })
        })
    }
]
