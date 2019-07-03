var Image = require('../models/image');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var multer = require('multer');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/' + req.body.type + '/')
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
}).single('imageUpload');

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

//Hiển thị danh sách tất cả hình ảnh.
exports.image_list = function (req, res) {

    Image.find({}, 'name contentType')
        .exec(function (err, list_images) {
            if (err) { return next(err); }
            //Thành công, render nó
            res.render('admin/image_list', { title: 'Danh sách hình ảnh', image_list: list_images });
        });

};

// Hiển thị thông tin chi tiết hình ảnh.
exports.image_detail = function (req, res,next) {

    async.parallel({
        image: function (callback) {
            Image.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.image == null) {  //Nhân vật ko tồn tại
            var err = new Error('Không tìm thấy hình ảnh');
            err.startus = 404;
            return next(err);
        }
        //Tìm thấy tài khoản, triển ngay
        res.render('admin/image_detail', { title: 'Chi tiết hình ảnh', image: results.image });
    });

};

// Hiển thị form tạo hình ảnh bằng GET.
exports.image_create_get = function (req, res) {

    res.render('admin/image_form', { title: 'Thêm hình ảnh' });

};

// Xử lý tạo hình ảnh bằng POST.
exports.image_create_post = [
    sanitizeBody('*').escape(),
    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/image_form', { title: 'Thêm hình ảnh', image: req.body, errors: errors.array() });
        }
        else {
            Image.findOne({ 'name': req.body.name })
                .exec(function (err, found_image) {
                    if (found_image) {
                        //Tài khoản đã tồn tại, chuyển về trang chi tiết tài khoản đó
                        res.send('Ảnh đã tồn tại');
                        //res.redirect(found_image.adminurl);
                    }
                    else {
                        upload(req, res, (err) => {
                            if (err) {
                                res.render('admin/image_form', {
                                    msg: err
                                });
                            } else {
                                if (req.file == undefined) {
                                    res.render('admin/image_form', {
                                        msg: 'Error: No File Selected!'
                                    });
                                } else {

                                    var image = new Image({
                                        name: req.body.name,
                                        value: '/images/' + req.body.type + '/' + req.body.name + path.extname(req.file.originalname),
                                        contentType: req.file.mimetype
                                    })
                                    try {
                                        console.log(req.headers);
                                        transaction.insert('Image', image);
                                        transaction.run();
                                        res.render('admin/image_form', {
                                            msg: 'File Uploaded!',
                                            file: 'http://' + req.headers.host + image.value
                                        });
                                    } catch{
                                        res.render('admin/image_form', {
                                            msg: 'Lỗi khi lưu database',
                                            file: `uploads/${req.file.filename}`
                                        });
                                        transaction.rollback();
                                        transaction.clean();
                                    }
                                }
                            }
                        });
                    }
                })
        }

    }
]

// Hiển thị form xóa hình ảnh bằng GET.
exports.image_delete_get = function (req, res) {

    async.parallel({
        image: function (callback) {
            Image.findById(req.params.id).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.image == null) {  //ko lỗi
            res.redirect('/admin/images');
        }
        //Thành công
        res.render('admin/image_delete', { title: 'Xóa hình ảnh', image: results.image });
    })

};

// Xử lý xóa hình ảnh bằng POST.
exports.image_delete_post = function (req, res) {

    async.parallel({
        image: function (callback) {
            Image.findById(req.body.imageid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        //Thành công
        try {
            transaction.remove('Image', results.image._id);
            await transaction.run()
            res.redirect('/admin/images');
        } catch (err) {
            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
            res.render('admin/image_delete', { title: 'Xóa hình ảnh', image: results.image });
            transaction.rollback();
            transaction.clean();
        }
    })

};

// Hiển thị cập nhật hình ảnh bằng GET.
exports.image_update_get = function (req, res) {

    async.parallel({
        image: function (callback) {
            Image.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.image == null) {
            var err = new Error('Hình ảnh không tồn tại');
            err.status = 404;
            return next(err);
        }
        //Thành công
        res.render('admin/image_form', { title: 'Cập nhật hình ảnh', image: results.image });
    })

};

// Xử lý cập nhật hình ảnh bằng POST.
exports.image_update_post = [
    [
        sanitizeBody('*').escape(),
        (req, res, next) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/image_form', { title: 'Cập nhật hình ảnh', image: req.body, errors: errors.array() });
            }
            else {
                upload(req, res, (err) => {
                    if (err) {
                        res.render('admin/image_form', {
                            msg: err,
                            image: null
                        });
                    } else {
                        if (req.file == undefined) {
                            res.render('admin/image_form', {
                                msg: 'Error: No File Selected!',
                                image: null
                            });
                        } else {
                            async.parallel({
                                image: function (callback) {
                                    Image.findById(req.params.id).exec(callback)
                                }
                            }, async function (err, results) {
                                if (err) return next(err);
                                var image = new Image({
                                    name: req.body.name,
                                    value: '/images/' + req.body.type + '/' + req.body.name + path.extname(req.file.originalname),
                                    contentType: req.file.mimetype,
                                    _id: results.image._id
                                })
                                try {
                                    transaction.update('Image', results.image._id, image);
                                    await transaction.run();
                                    res.redirect(image.url);
                                } catch{
                                    res.render('admin/image_form', {
                                        msg: 'Lỗi khi lưu database',
                                        file: `uploads/${req.file.filename}`
                                    });
                                    transaction.rollback();
                                    transaction.clean();
                                }
                            })
                        }
                    }
                });
            }

        }
    ]
]
