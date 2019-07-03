var Poketype = require('../models/poketype');
var async = require('async')
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()

//Hiển thị danh sách tất cả loại Pokémon.
exports.poketype_list = function (req, res) {
    Poketype.find({}, 'name image')
        .exec(function (err, list) {
            if (err) { return next(err); }
            res.render('admin/poketype_list', { title: 'Danh sách các loại Pokemon', poketype_list: list });
        });
};

// Hiển thị thông tin chi tiết loại Pokémon.
exports.poketype_detail = function (req, res, next) {
    async.parallel({
        poketype: function (callback) {
            Poketype.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, result) {
        if (err) { return next(err); }
        if (result.poketype == null) {
            var err = new Error('Không có loại Pokemon nào');
            err.status = 404;
            return next(err);
        }
        res.render('admin/poketype_detail', { title: 'Chi tiết loại Pokemon', poketype: result.poketype });
    })
};

// Hiển thị form tạo loại Pokémon bằng GET.
exports.poketype_create_get = function (req, res) {
    res.render('admin/poketype_form', { title: 'Tạo loại Pokemon' });
};

// Xử lý tạo loại Pokémon bằng POST.
exports.poketype_create_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('poketypename').isLength({ min: 1 }).withMessage('Tên loại Pokemon không hợp lệ.'),
    body('poketypeimage').isLength({ min: 1 }).withMessage('Loại vật phẩm không hợp lệ.'),
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/poketype_form', { title: 'Tạo loại Pokemon', poketype: req.body, errors: error.array() });
        }
        else {
            //Dữ liệu hợp lệ
            //Kiểm tra xem tài khoản tồn tại chưa            
            Poketype.findOne({ 'name': req.body.poketypename })
                .exec(function (err, found_poketype) { //
                    if (found_poketype) {
                        //Vật phẩm đã tồn tại, chuyển về trang chi tiết vật phẩm đó
                        res.redirect(found_poketype.url);
                    }
                    //Nếu k trùng, k lỗi thì tạo thôi
                    else {
                        var poketype = new Poketype({
                            name: req.body.poketypename,
                            image: req.body.poketypeimage
                        });
                        try {
                            //Tạo biến poketype trong bảng Poketype
                            transaction.insert('Poketype', poketype);                            
                            //Thực hiện trans
                            transaction.run();
                            res.redirect('/admin/poketypes');
                        } catch (error) {
                            //Nếu có lỗi thì xuất lỗi, rollback.
                            console.error(error);
                            transaction.rollback().catch(console.error);
                            transaction.clean();
                            res.render('admin/poketype_form', { title: 'Tạo loại Pokemon', poketype: req.body });
                        }
                    }
                });
        }
    }

];

// Hiển thị form xóa loại Pokémon bằng GET.
exports.poketype_delete_get = function (req, res, next) {
    async.parallel({
        poketype: function (callback) {
            Poketype.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, results,next) {
        if (err) {
            console.log('Lỗi r')
            return next(err);
        }
        if (results.poketype == null) {  //ko lỗi
            res.redirect('/admin/poketypes');
        }
        //Thành công
        res.render('admin/poketype_delete', { title: 'Xóa loại Pokemon', poketype: results.poketype });
    })
};

// Xử lý xóa loại Pokémon bằng POST.
exports.poketype_delete_post = function (req, res) {
    async.parallel({
        poketype: function (callback) {
            Poketype.findById(req.body.poketypeid).exec(callback);
        }
    },async function (err, results) {
        if (err) { return next(err); }
        //Thành công
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.remove('Poketype', results.poketype._id);
            await transaction.run();
            res.redirect('/admin/poketypes')
        } catch (error) {
            console.error(error)
            transaction.rollback().catch(console.error)
            transaction.clean()
            res.render('admin/poketype_delete', { title: 'Xóa loại Pokemon', poketype: req.body, errors: error.array() })
        }
    }
    )
};

// Hiển thị cập nhật loại Pokémon bằng GET.
exports.poketype_update_get = function (req, res) {
    res.render('admin/poketype_form', { title: 'Sửa loại Pokemon' });
};

// Xử lý cập nhật loại Pokémon bằng POST.
exports.poketype_update_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('poketypename').isLength({ min: 1 }).withMessage('Tên loại Pokemon không hợp lệ.'),
    body('poketypeimage').isLength({ min: 1 }).withMessage('Loại vật phẩm không hợp lệ.'),
    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/poketype_form', { title: 'Sửa loại Pokemon', poketype: req.body, errors: error.array() });
        }
        else {
            async.parallel({
                poketype: function (callback) {
                    //req.params là lấy trên thanh truy cập
                    Poketype.findById(req.params.id).exec(callback);
                }
            }, async function (err, results) {
                if (err) {                    
                    return next(err);
                }else{                    
                var poketype1 = new Poketype({
                    name: req.body.poketypename,
                    image: req.body.poketypeimage,
                    //Id của poketype1 phải trùng với id của poketype cũ mới có thể sửa
                    _id: results.poketype._id
                }); 
                    try {
                        //Thực hiện update, bỏ dữ liệu từ poketype1 đã nhập vào 
                        transaction.update('Poketype', results.poketype._id, poketype1);
                        //Thực hiện trans
                        await transaction.run();
                        res.redirect('/admin/poketypes');
                    } catch (error) {
                        console.error(error);
                        transaction.rollback().catch(console.error);
                        transaction.clean();
                        res.render('admin/poketype_form', { title: 'Sửa loại Pokemon', poketype: req.body });
                    }
                }
            
            })
        }
    }
];