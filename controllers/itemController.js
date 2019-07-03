var Item = require('../models/item');
var Cashshop = require("../models/cashshop");
var async = require('async');
var Image = require('../models/image');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
var multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/item/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name.toLowerCase().replace(/ /g, '-') + path.extname(file.originalname));
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


// Xử lý tạo vật phẩm bằng POST.
exports.item_create_post = [
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    upload.single('myFile'),
    async (req, res, next) => {
        const error = validationResult(req);
        Item.findOne({ name: req.body.name, typeuse: req.body.type })
            .exec(function (err, item_found) {
                if (item_found) {
                    res.redirect(`/admin/cashshops?msg=` + encodeURI("Vật phẩm đã tồn tại"));
                    return;
                }
            });
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var msg = '';
            error.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/cashshops?msg=` + encodeURI(msg));
        }
        else {
            if (req.file == undefined) {
                res.redirect(`/admin/cashshops?msg=` + encodeURI("Hình ảnh không hợp lệ"));
            } else {
                var image = new Image({
                    name: req.body.name,
                    value: '/images/item/' + req.body.name.toLowerCase().replace(/ /g, '-') + path.extname(req.file.originalname),
                    contentType: req.file.mimetype
                })
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var item = new Item({
                    typeuse: req.body.type,
                    name: req.body.name,
                    detail: req.body.detail,
                    image: image._id
                });

                try {
                    //Tạo biến poketype trong bảng Poketype
                    transaction.insert('Item', item);
                    transaction.insert('Image', image);
                    //Thực hiện trans
                    await transaction.run().then(() => {
                        transaction.clean();
                        res.redirect(`/admin/cashshops?msg=` + encodeURI("Thêm vật phẩm thành công"));
                    });

                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    transaction.rollback();
                    transaction.clean(); //éo phải lỗi ở đây
                    res.redirect(`/admin/cashshops?msg=` + encodeURI("Thêm vật phẩm thất bại (DB)"));
                }
            }
        }
    }
];

// Xử lý xóa vật phẩm bằng POST.
exports.item_delete_post = function (req, res, next) {
    Item.findById(req.body.itemid).exec(async (err, data) => {
        if (err) { return next(err); }
        //Thành công
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.remove('Item', data._id);
            await transaction.run().then(() => {
                transaction.clean();
                res.redirect(`/admin/cashshops?msg=` + encodeURI("Xóa vật phẩm thành công"));
            });
        } catch (error) {
            console.error(error)
            transaction.rollback();
            transaction.clean()
            res.redirect(`/admin/cashshops?msg=` + encodeURI("Xóa vật phẩm thất bại (DB)"));
        }
    })
};


// Xử lý cập nhật vật phẩm bằng POST.
exports.item_update_post = [
    upload.single("myFile"),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var msg = '';
            errors.array().forEach(element => {
                msg += element.msg + ". "
            });
            res.redirect(`/admin/cashshops?msg=` + encodeURI(msg));
        }
        else {
            if (req.file == undefined && req.body.image == undefined) {
                res.redirect(`/admin/cashshops?msg=` + encodeURI("Hình ảnh không hợp lệ"));
                return
            }
            var item = new Item({
                typeuse: req.body.type,
                name: req.body.name,
                detail: req.body.detail,
                image: req.body.image,
                _id: req.params.id
            });
            try {
                if (req.file != undefined) {
                    Image.find({ name: req.body.name, contentType: req.file.mimetype })
                        .exec((err, data) => {
                            if (err) throw err;
                            if (data) {
                                transaction.update('Item', req.params.id, item);
                                transaction.update('Image', data._id, image);
                            }
                            else {
                                var image = new Image({
                                    name: req.body.name,
                                    value: '/images/item/' + req.body.name.toLowerCase().replace(' ', '-') + path.extname(req.file.originalname),
                                    contentType: req.file.mimetype
                                });
                                pokemon.image = image._id;
                                transaction.update('Item', req.params.id, item);
                                transaction.insert('Image', image);
                            }
                        });
                }
                else
                    transaction.update('Item', req.params.id, item);
                //Thực hiện trans
                await transaction.run().then(()=>{
                    transaction.clean();
                    res.redirect(`/admin/cashshops?msg=` + encodeURI("Cập nhật vật phẩm thành công"));
                });
            } catch (error) {
                //Nếu có lỗi thì xuất lỗi, rollback.
                transaction.rollback()
                transaction.clean(); //éo phải lỗi ở đây
                res.redirect(`/admin/cashshops?msg=` + encodeURI("Cập nhật vật phẩm thất bại (DB)"));
            }
        }
    }
]

