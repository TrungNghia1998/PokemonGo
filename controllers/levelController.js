var Level = require('../models/level');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
//Hiển thị danh sách tất cả cấp độ.
exports.level_list = function (req, res) {
    Level.find({}, 'level xpNext total')
        .exec(function (err, list_level) {
            if (err) { return next(err); }
            res.render('admin/level_list', { title: 'Danh sách level', level_list: list_level });
        });
};

// Hiển thị thông tin chi tiết cấp độ.
exports.level_detail = function (req, res, next) {
    async.parallel({
        level: function (callback) {
            Level.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, result) {
        if (err) { return next(err); }
        if (result.level == null) {
            var err = new Error('Không tìm thấy level');
            err.status = 404;
            return next(err);
        }
        res.render('admin/level_detail', { title: 'Chi tiet level', level: result.level });
    })
};

// Hiển thị form tạo cấp độ bằng GET.
exports.level_create_get = function (req, res) {
    res.render('admin/level_form', { title: 'Tạo level' });
};

// Xử lý tạo cấp độ bằng POST.
exports.level_create_post = [
    body('levelname').isLength({ min: 1 }).withMessage('Tên câp độ không hợp lệ'),
    body('expdetail').isNumeric({ min: 1 }).withMessage('Kinh nghiệm cần lên cấp không hợp lệ'),
    body('exptotal').isNumeric({ min: 1 }).withMessage('Kinh nghiệm đã tích lũy được không hợp lệ'),

    //Dữ liệu đầu vào sạch
    sanitizeBody('*').escape(),
    (req, res, next) => {
        console.log(req.body);
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/level_form', { title: 'Tạo level', level: req.body, errors: error.array() });
        }
        else {

            //Dữ liệu hợp lệ
            //Kiểm tra xem tài khoản tồn tại chưa            
            Level.findOne({ 'level': req.body.levelname })
                .exec(async function (err, found_level) {
                    if (found_level) {
                        //Vật phẩm đã tồn tại, chuyển về trang chi tiết vật phẩm đó
                        res.redirect(found_level.url);
                    }
                    else {
                        //Tạo tài khoản với dữ liệu đã được "sạch".
                        var level = new Level({
                            level: req.body.levelname,
                            xpNext: req.body.expdetail,
                            total: req.body.exptotal
                        });
                        try {
                            //Tạo biến poketype trong bảng Poketype
                            transaction.insert('Level', level);
                            //Thực hiện trans
                            await transaction.run();
                            res.redirect('/admin/levels');
                        } catch (error) {
                            //Nếu có lỗi thì xuất lỗi, rollback.
                            console.error(error);
                            transaction.rollback().catch(console.error);
                            transaction.clean();
                            res.render('admin/level_form', { title: 'Tạo loại Pokemon', level: req.body });
                        }
                    }
                });
        }
    }
];

// Hiển thị form xóa cấp độ bằng GET.
exports.level_delete_get = function (req, res, next) {
    async.parallel({
        level: function (callback) {
            Level.findById(req.params.id).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.level == null) {  //ko lỗi
            res.redirect('/admin/levels');
        }
        //Thành công
        res.render('admin/level_delete', { title: 'Xóa cấp độ', level: results.level });
    })
};

// Xử lý xóa cấp độ bằng POST.
exports.level_delete_post = function (req, res) {
    async.parallel({
        level: function (callback) {
            Level.findById(req.body.levelid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        //Thành công
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.remove('Level', results.level._id);
            await transaction.run();
            res.redirect('/admin/levels')
        } catch (error) {
            console.error(error)
            transaction.rollback().catch(console.error)
            transaction.clean()
            res.render('admin/level_delete', { title: 'Xóa loại Pokemon', level: req.body, errors: error.array() })
        }
    })
};

// Hiển thị cập nhật cấp độ bằng GET.
exports.level_update_get = function (req, res) {
    async.parallel({
        level: function (callback) {
            Level.findById(req.params.id).exec(callback)
        },
        levels: function (callback) {
            Level.find({})
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.level == null) {  //ko lỗi
            res.redirect('/admin/levels');
        }
        //Thành công
        res.render('admin/level_form', { title: 'Cập nhật vật phẩm', level: results.level, levels: results.levels });
    })
};

// Xử lý cập nhật cấp độ bằng POST.
exports.level_update_post = [
    body('levelname').isLength({ min: 1 }).withMessage('Tên câp độ không hợp lệ'),
    body('expdetail').isNumeric({ min: 1 }).withMessage('Kinh nghiệm cần lên cấp không hợp lệ'),
    body('exptotal').isNumeric({ min: 1 }).withMessage('Kinh nghiệm đã tích lũy được không hợp lệ'),
    //Dữ liệu sạch
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/poketype_form', { title: 'Sửa loại Pokemon', poketype: req.body, errors: error.array() });
        }
        else {
            async.parallel({
                level: function (callback) {
                    Level.findById(req.params.id).exec(callback);
                }
            },async function (err, results) {
                if (err) { return next(err); }
                else {
                    //Extract the validation errors from a request.
                    const errors = validationResult(req);
                    var level1 = new Level({
                        level: req.body.levelname,
                        xpNext: req.body.expdetail,
                        total: req.body.exptotal,
                        _id: req.params.id
                    });
                }
                try {
                    //Thực hiện update, bỏ dữ liệu từ poketype1 đã nhập vào 
                    transaction.update('Level', results.level._id, level1);
                    //Thực hiện trans
                    await transaction.run();
                    res.redirect('/admin/levels');
                } catch (error) {
                    console.error(error);
                    transaction.rollback().catch(console.error);
                    transaction.clean();
                    res.render('admin/level_form', { title: 'Sửa loại Pokemon', level: req.body });
                }

            })
        }
    }
]