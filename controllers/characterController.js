var Character = require('../models/character');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Account = require('../models/account');
var Bag = require('../models/bag');
var Image = require('../models/image');
var Clan = require('../models/clan');
var async = require('async');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()


//Hiển thị danh sách tất cả nhân vật.
exports.character_list = function (req, res, next) {
    Character.find({}, '')
        .populate('accountid')
        .populate({ path: 'bagid', populate: { path: 'items.itemid', populate: { path: 'image' } } })
        .exec(function (err, list_characters) {
            if (err) { return next(err); }
            //Thành công, render nó
            console.log(list_characters);
            // console.log("---------------------------");
            // console.log(list_characters[0].bagid.items[0].itemid.image.value);
            // console.log(list_characters[0].bagid.items[1].itemid.image.value);
            res.render('admin/character_list', { title: 'Danh sách nhân vật', character_list: list_characters });
        });
};

//Load character data
exports.loadCharacterData = function (req, res) {
    Character.find({}, '')
        .populate('accountid')
        .populate({ path: 'bagid', populate: { path: 'items.itemid', populate: { path: 'image' } } })
        .exec(function (err, list_characters) {
            if (err) { return next(err); }
            //Success
            var listDate = [];
            for (var i = 0; i < list_characters.length; i++) {
                listDate.push(list_characters[i].createdate_formatted);
            }
            console.log(listDate);
            console.log(list_characters[0].accountid.username);
            res.status(200).json({ data: list_characters, date: listDate });
        })
}

// Hiển thị thông tin chi tiết nhân vật.
exports.character_detail = function (req, res, next) {
    async.parallel({
        character: function (callback) {
            Character.findById(req.params.id)
                .populate('accountid')
                .populate('imageid')
                .populate('friends')
                .populate('clanid')
                .populate('bagid')
                .populate('pokestop.id')
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.character == null) {  //Nhân vật ko tồn tại
            var err = new Error('Không tìm thấy nhân vật');
            err.startus = 404;
            return next(err);
        }
        //Tìm thấy tài khoản, triển ngay
        res.render('admin/character_detail', { title: 'Chi tiết nhân vật', character: results.character });
    });

};

// Hiển thị form tạo nhân vật bằng GET cho admin.
exports.character_create_get = function (req, res, next) {

    async.parallel({
        account: function (callback) {
            Account.find().exec(callback)
        },
        image: function (callback) {
            Image.find().exec(callback)
        },
        clan: function (callback) {
            Clan.find()
                .populate('logo').exec(callback)
        }
    }, function (err, results) {

        if (err) { return next(err); }
        res.render('admin/character_form', { title: 'Tạo nhân vật', accounts: results.account, images: results.image, clans: results.clan });
    })

};

// Xử lý tạo nhân vật bằng POST cho admin
exports.character_create_post = [
    body('name').isLength({ min: 5, max: 15 }).withMessage('Tên nhân vật phải thuộc 5 - 15 kí tự'),
    body('baglimit').custom((value) => {
        if (value < 300) { throw new Error('Giới hạn túi tối thiểu là 300') }
        else { return true; }
    }),
    sanitizeBody('*').escape(),
    (req, res, next) => {

        const errors = validationResult(req);
        async.parallel({
            character: function (callback) {
                Character.find().exec(callback)
            },
            account: function (callback) {
                Account.find().exec(callback)
            },
            image: function (callback) {
                Image.find().exec(callback)
            },
            clan: function (callback) {
                Clan.find().exec(callback)
            }
        }, async function (err, results) {
            if (!errors.isEmpty()) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/character_form', { title: 'Tạo nhân vật', accounts: results.account, images: results.image, clans: results.clan, errors: errors.array() });
            }
            else {
                if (results.character.indexOf({ 'accountid': req.body.accountid }) != -1) {
                    var err = [{ param: 'characterExist', msg: 'Tài khoản này đã có nhân vật.' }];
                    res.render('admin/character_form', { title: 'Tạo nhân vật', accounts: results.account, images: results.image, clans: results.clan, errors: err });
                }
                else {
                    //Tạo túi cho nhân vật mới.
                    var bag = new Bag({
                        characterid: null,
                        limit: req.body.baglimit,
                        items: new Array(),
                        pokebag: new Array()
                    })
                    var character = new Character({
                        accountid: req.body.accountid,
                        name: req.body.name,
                        imageid: req.body.imageid,
                        level: req.body.level,
                        exp: req.body.exp,
                        gender: req.body.gender,
                        gem: req.body.gem,
                        friends: new Array(),
                        clanid: req.body.clanid,
                        bagid: bag._id,
                        createdate: new Date(),
                        xpos: req.body.xpos,
                        ypos: req.body.ypos,
                        isVIP: null
                    });
                    bag.characterid = character._id;
                    //triển database
                    try {
                        transaction.insert('Bag', bag);
                        transaction.insert('Character', character);
                        await transaction.run();
                        res.redirect(character.adminurl);

                    } catch (err) {
                        err = [{ params: 'transError', msg: 'Lỗi database' }]
                        res.render('admin/character_form', { title: 'Tạo nhân vật', accounts: results.account, images: results.image, clans: results.clan, errors: err });
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            }
        })

    }
]

// Hiển thị cập nhật nhân vật bằng GET.
exports.character_update_get = function (req, res, next) {

    async.parallel({
        character: function (callback) {
            Character.findById(req.params.id)
                .populate('accountid')
                .populate('imageid')
                .populate('friends')
                .populate('clanid')
                .populate('bagid')
                .populate('pokestop.id')
                .exec(callback);
        },
        account: function (callback) {
            Account.find().exec(callback)
        },
        image: function (callback) {
            Image.find().exec(callback)
        },
        clan: function (callback) {
            Clan.find().exec(callback)
        }
    }, function (err, results) {

        if (err) { return next(err); }
        res.render('admin/character_form', { title: 'Cập nhật nhân vật', character: results.character, accounts: results.account, images: results.image, clans: results.clan });
    })

};

// Xử lý cập nhật nhân vật bằng POST.
exports.character_update_post = [
    body('name').isLength({ min: 5, max: 15 }).withMessage('Tên nhân vật phải thuộc 5 - 15 kí tự'),
    body('baglimit').custom((value) => {
        if (value < 300) { throw new Error('Giới hạn túi tối thiểu là 300') }
        else { return true; }
    }),
    sanitizeBody('*').escape(),
    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/character_form', { title: 'Cập nhật nhân vật', character: req.body, accounts: results.account, images: results.image, clans: results.clan, errors: errors.array() });
        }
        else {
            async.parallel({
                character: function (callback) {
                    Character.findById(req.params.id)
                        .populate('accountid')
                        .populate('imageid')
                        .populate('friends')
                        .populate('clanid')
                        .populate('bagid')
                        .populate('pokestop.id')
                        .exec(callback)
                },
                account: function (callback) {
                    Account.find().exec(callback)
                },
                image: function (callback) {
                    Image.find().exec(callback)
                },
                clan: function (callback) {
                    Clan.find().exec(callback)
                }
            }, async function (err, results) {
                if (err) return next(err);
                var character = new Character({
                    accountid: req.body.accountid,
                    name: req.body.name,
                    imageid: req.body.imageid,
                    level: req.body.level,
                    exp: req.body.exp,
                    gender: req.body.gender,
                    gem: req.body.gem,
                    friends: results.character.friends,
                    clanid: req.body.clanid,
                    bagid: results.character.bagid,
                    createdate: results.character.createdate,
                    xpos: req.body.xpos,
                    ypos: req.body.ypos,
                    _id: results.character._id
                });
                //triển database
                try {
                    transaction.update('Character', results.character._id, character);

                    await transaction.run();
                    console.log(transaction.getOperations())
                    res.redirect(character.adminurl);
                } catch (err) {
                    err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                    res.render('admin/character_form', { title: 'Cập nhật nhân vật', errors: err, character: results.character, accounts: results.account, images: results.image, clans: results.clan });
                    transaction.rollback();
                    transaction.clean();
                }
            })
        }

    }
]




//====================USER==================================================
// Hiển thị form tạo nhân vật bằng GET cho user.
exports.character_create_get_user = function (req, res) {
    res.render('ingame/character_form', { title: 'Tạo nhân vật' });

};

//Load detail lên modal
exports.loadCharacterDetail = function (req, res) {
    var id = req.body.id;
    console.log(id);
    Character.findById({ _id: id }, function (err, character) {
        if (err) throw err;
        //Success
        console.log(123);
        res.status(200).json({ data: character, status: true });
    })
};

// Xử lý tạo nhân vật bằng POST cho user
exports.character_create_post_user = [
    body('name').isLength({ min: 5, max: 15 }).withMessage('Tên nhân vật phải thuộc 5 - 15 kí tự'),
    body('gender').isBoolean().withMessage('Giới tính ko hợp lệ'),
    sanitizeBody('*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('ingame/character_form', { title: 'Tạo nhân vật', errors: errors.array() });
        }
        else {
            Character.find({ name: req.body.name }).exec(async (err, data) => {
                if (data.length > 0) {
                    console.log(data)
                    var err = [{ param: 'nameExist', msg: 'Tên nhân vật đã tồn tại.' }];
                    res.render('ingame/character_form', { title: 'Tạo nhân vật', errors: err });
                }
                else {
                    //Tạo túi cho nhân vật mới.
                    var bag = new Bag({
                        characterid: null,
                        limit: 300,
                        items: new Array(),
                        pokebag: new Array()
                    })
                    //thêm bóng cho người chơi mới
                    bag.items.push({ itemid: '5c9742f813b44c2cecd19538', amount: 10 })
                    
                    var character = new Character({
                        accountid: req.user._id,
                        name: req.body.name,
                        imageid: req.body.gender == "true" ? '5ca0653f935fc208b0563402' : '5ca0654c935fc208b0563403',
                        level: 1,
                        exp: 0,
                        gender: req.body.gender,
                        gem: 0,
                        friends: new Array(),
                        clanid: req.body.clan,
                        bagid: bag._id,
                        createdate: new Date(),
                        xpos: req.body.xpos == '' ? "10.849784" : req.body.xpos,
                        ypos: req.body.ypos == '' ? "106.771480" : req.body.ypos,
                        pokedex: new Array()
                    });
                    bag.characterid = character._id;
                    req.user.characterid = character._id;
                    //triển database
                    try {
                        transaction.insert('Bag', bag);
                        transaction.insert('Character', character);
                        transaction.update('Account', req.user._id, req.user);
                        await transaction.run();
                        res.redirect('/ingame')

                    } catch (err) {
                        err = [{ params: 'transError', msg: 'Tạo nhân vật thất bại (DB)' }]
                        
                        res.render('ingame/character_form', { title: 'Tạo nhân vật', errors: err });
                        transaction.rollback();
                        transaction.clean();
                    }
                }
            })
        }
    }
]


//Xử lý follow
exports.character_follow = [
    sanitizeBody('*').escape(),
    (req, res, next) => {
        async.parallel({
            character: function (callback) {
                Character.findOne({ accountid: req.user._id }).exec(callback)
            },
            friend: function (callback) {
                Character.findOne({ name: req.body.name }).exec(callback)
            },
        }, async function (err, results) {
            if (err) return next(err)
            function checkExist() {
                for (var i = 0; i < results.character.friends.length; i++) {
                    if (results.character.friends[i].toString() == results.friend._id.toString()) {
                        res.json({ content: "Bạn đã follow người này rồi!" })
                        return;
                    }
                }
            }
            await checkExist();
            console.log('im here')
            results.character.friends.push(results.friend._id);
            try {
                transaction.update("Character", results.character._id, results.character);
                await transaction.run();
                res.json({ content: "Follow thành công!" });
            } catch (err) {
                res.sendStatus(898);
                transaction.rollback();
                transaction.clean();
            }
        })
    }
]