var Pokemon = require('../models/pokemon');
var PokemonPosition = require('../models/pokemonposition');
var Image = require('../models/image');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
var multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/pokemon/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name.toLowerCase() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
})

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Lỗi: Chỉnh nhận file hình ảnh!');
    }
}

//Hiển thị danh sách tất cả pokémon.
exports.pokemon_list = function (req, res) {
    let msg = req.query.msg == undefined ? 'Pokémon nhiều quá O.o' : req.query.msg;
    async.parallel({
        list_pokemonPosition: function (callback) {
            PokemonPosition.find({})
                .populate({ path: 'characterlist.characterid', model: 'Character' })
                .populate('pokeid')
                .populate({ path: 'pokeid', populate: { path: 'image' } })
                .populate({ path: 'pokeid', populate: { path: 'type' } })
                .exec(callback);
        },
        list_pokemon: function (callback) {
            Pokemon.find()
                .populate('type')
                .populate('image')
                .exec(callback)
        },
        list_images: function (callback) {
            Image.find({ "value": /pokemon/ })
                .exec(callback)
        },
        list_type: function (callback) {
            Image.find({ "value": /element/, "contentType": "image/png" })
                .exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        results.list_pokemon.sort(function (a, b) {
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

        results.list_pokemonPosition.sort(function (a, b) {
            var nameA = a.pokeid.name.toUpperCase(); // bỏ qua hoa thường
            var nameB = b.pokeid.name.toUpperCase(); // bỏ qua hoa thường
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // name trùng nhau
            return 0;
        });
        res.render('admin/pokemon_list', {
            title: 'Quản lý Pokémon | Admin - MiddleField',
            name: req.user.username, pokemon_list: results.list_pokemon,
            pokemonPosition_list: results.list_pokemonPosition,
            image_list: results.list_images,
            type_list: results.list_type,
            msg: msg
        });
    });
};

// Xử lý tạo pokémon bằng POST.
exports.pokemon_create_post = [
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    upload.single('myFile'),
    async (req, res, next) => {
        const error = validationResult(req);

        Pokemon.findOne({ name: req.body.name })
            .exec(function (err, pokemon_found) {
                if (pokemon_found) {
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`${req.body.name} đã tồn tại`));
                    return;
                }
            })

        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/pokemons?msg=` + encodeURI(msg));
        }
        else {
            if (req.file == undefined) {
                res.redirect(`/admin/pokemons?msg=` + encodeURI("Hình ảnh không hợp lệ"));
            } else {

                var image = new Image({
                    name: req.body.name,
                    value: '/images/pokemon/' + req.body.name.toLowerCase() + path.extname(req.file.originalname),
                    contentType: req.file.mimetype
                })
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var pokemon = new Pokemon({
                    type: req.body.type,
                    name: req.body.name,
                    detail: req.body.detail,
                    image: image._id
                });

                try {
                    //Tạo biến poketype trong bảng Poketype
                    transaction.insert('Pokemon', pokemon);
                    transaction.insert('Image', image);
                    await transaction.run().then(() => {
                        transaction.clean();
                        res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thêm ${req.body.name} thành công`));
                    });
                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    console.log(error)
                    transaction.rollback();
                    transaction.clean(); //éo phải lỗi ở đây
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`Thêm ${req.body.name} thất bại (DB)`));
                }
            }
        }
    }
];

// Xử lý cập nhật pokémon bằng POST.
exports.pokemon_update_post = [
    //Xử lý request khi các thông tin đã đạt chuẩn.
    upload.single("myFile"),
    async (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.render('admin/pokemon_list', {
                title: 'Quản lý Pokémon | Admin - MiddleField',
                name: req.user.username,
                pokemon_list: results.list_pokemon,
                pokemonPosition_list: results.list_pokemonPosition,
                image_list: results.list_images,
                type_list: results.list_type,
                msg: msg
            });
        }
        else {
            if (req.file == undefined && req.body.image == undefined) {
                res.redirect(`/admin/pokemons?msg=` + encodeURI("Hình ảnh không hợp lệ"));
            }
            else {
                var pokemon = new Pokemon({
                    type: req.body.type,
                    name: req.body.name,
                    detail: req.body.detail,
                    image: req.body.image,
                    _id: req.params.id
                });
                try {
                    //Tạo biến poketype trong bảng Poketype
                    if (req.body.image == undefined) {
                        Image.find({ name: req.body.name, contentType: req.file.mimetype })
                            .exec((err, data) => {
                                if (err) throw err;
                                if (data) {
                                    transaction.update('Pokemon', req.params.id, pokemon);
                                    transaction.update('Image', data._id, image);
                                }
                                else {
                                    var image = new Image({
                                        name: req.body.name,
                                        value: '/images/pokemon/' + req.body.name.toLowerCase() + path.extname(req.file.originalname),
                                        contentType: req.file.mimetype
                                    });
                                    pokemon.image = image._id;
                                    transaction.update('Pokemon', req.params.id, pokemon);
                                    transaction.insert('Image', image);
                                }
                            });
                    }
                    else {
                        transaction.update('Pokemon', req.params.id, pokemon);
                    }
                    //Thực hiện trans
                    await transaction.run().then(() => {
                        transaction.clean();
                        res.redirect(`/admin/pokemons?msg=` + encodeURI(`Cập nhật ${req.body.name} thành công`));
                    });
                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    console.log(error);
                    transaction.rollback()
                    transaction.clean(); //éo phải lỗi ở đây
                    res.redirect(`/admin/pokemons?msg=` + encodeURI(`Cập nhật ${req.body.name} thất bại (DB)`));
                }
            }
        }
    }
]