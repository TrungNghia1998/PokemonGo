var News = require('../models/news');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
//Trang chủ
exports.index = function (req, res) {
    News.find({}, 'title content date typenews')
        .exec(function (err, list_new) {
            if (err) { return next(err); }
            res.render('pug_hoang/home', {news_list_for_user: list_new, total: list_new.length});
        });
};

//Hiển thị danh sách tất cả tin tức.
exports.news_list = function (req, res) {
    //find=find_all
    News.find({}, 'title content date typenews')
        .exec(function (err, list_new) {
            if (err) { return next(err); }
            console.log(list_new)
            res.render('admin/news_list', { title: 'Danh sách các tin tức', news_list: list_new });
        });
};

//Hoàng 
exports.news_detail_for_user = function (req, res, next) {
    console.log(req.params.id)
    News.findOne({_id: req.params.id}, 'title content date typenews')
    .exec(function (err, list_new) {
        if (err) { return next(err); }
        console.log(list_new);
        res.render('pug_hoang/home_news_details', {news_list_for_user: list_new});
    });
};

// Hiển thị thông tin chi tiết tin tức.
exports.news_detail = function (req, res, next) {
    async.parallel({
        news: function (callback) {
            News.findById(req.params.id)
                .exec(callback);
        }
    }, function (err, result) {
        if (err) { return next(err); }
        if (result.news == null) {
            var err = new Error('Không tìm thấy tin tức');
            err.status = 404;
            return next(error);
        }
        res.render('admin/news_detail', { title: 'Chi tiết tin tức', news: result.news });
    })
};

// Hiển thị form tạo tin tức bằng GET.
exports.news_create_get = function (req, res) {
    res.render('admin/news_form', { title: 'Tạo tin tức' });
};

// Xử lý tạo tin tức bằng POST.
exports.news_create_post = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('newstitle').isLength({ min: 1 }).withMessage('Tên tin tức không hợp lệ.'),
    body('newscontent').isLength({ min: 1 }).withMessage('Nội dung tin tức không hợp lệ.'),
    body('newsdate').exists()
        .not()
        .isEmpty()
        .withMessage('Ghi ngày dô cha nội')
        .isISO8601('yyyy-mm-dd')
        .matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])')
        .withMessage('Ngày tạo chưa đúng format yyyy:mm:dd'),
    body('newstype').isLength({ min: 1 }).withMessage('Loại tin tức không hợp lệ.'),

    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/news_form', { title: 'Tạo tin tức', news: req.body, errors: error.array() });
        }
        else {
            //Dữ liệu hợp lệ
            //Kiểm tra xem tin tức tồn tại chưa
            News.findOne({ 'name': req.body.newstitle })
                .exec(async function (err, found_news) {
                    if (found_news) {
                        //Vật phẩm đã tồn tại, chuyển về trang chi tiết vật phẩm đó
                        res.redirect(found_news.url);
                    }
                    else {
                        //Tạo tài khoản với dữ liệu đã được "sạch".
                        var news = new News({
                            title: req.body.newstitle,
                            typenews: req.body.newstype,
                            content: req.body.newscontent,
                            date: req.body.newsdate
                        });
                        try {
                            //Tạo biến poketype trong bảng Poketype
                            transaction.insert('News', news);
                            //Thực hiện trans
                            await transaction.run();
                            res.redirect('/admin/news');
                        } catch (error) {
                            //Nếu có lỗi thì xuất lỗi, rollback.
                            console.error(error);
                            transaction.rollback().catch(console.error);
                            transaction.clean();
                            res.render('admin/news_form', { title: 'Tạo Pokemon Stop', news: req.body, errors: error.array() });
                        }
                    }
                });
        }
    }
];

// Hiển thị form xóa tin tức bằng GET.
exports.news_delete_get = function (req, res, next) {
    async.parallel({
        news: function (callback) {
            News.findById(req.params.id).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.news == null) {  //ko lỗi
            res.redirect('/admin/news');
        }
        //Thành công
        res.render('admin/news_delete', { title: 'Xóa vật phẩm', news: results.news });
    })
};

// Xử lý xóa tin tức bằng POST.
exports.news_delete_post = function (req, res) {
    async.parallel({
        news: function (callback) {
            News.findById(req.body.newsid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        try {
            //Nếu k có lỗi thì xóa poketype có _id như results ở trên
            transaction.remove('News', results.news._id);
            await transaction.run();
            res.redirect('/admin/news');
        } catch (error) {
            console.error(error)
            transaction.rollback().catch(console.error)
            transaction.clean()
            res.render('admin/news_form', { title: 'Xóa Pokemon Stop', news: req.body, errors: error.array() })
        }
    })
};

// Hiển thị cập nhật tin tức bằng GET.
exports.news_update_get = function (req, res) {
    async.parallel({
        news: function (callback) {
            News.findById(req.params.id).exec(callback)
        },
        news1: function (callback) {
            News.find({})
                .exec(callback);
        }
    }, function (err, results, next) {
        if (err) { return next(err); }
        if (results.news == null) {  //ko lỗi
            res.redirect('/admin/news');
        }
        //Thành công
        res.render('admin/news_form', { title: 'Cập nhật vật phẩm', news: results.news, news1: results.news1 });
    })
};

// Xử lý cập nhật tin tức bằng POST.
exports.news_update_post = [
    body('newstitle').isLength({ min: 1 }).withMessage('Tên tin tức không hợp lệ.'),
    body('newscontent').isLength({ min: 1 }).withMessage('Nội dung tin tức không hợp lệ.'),
    body('newsdate').isLength({ min: 1 }).withMessage('Ngày không hợp lệ'),
    body('newstype').isLength({ min: 1 }).withMessage('Loại tin tức không hợp lệ.'),

    //Dữ liệu sạch
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    (req, res, next) => {
        async.parallel({
            news: function (callback) {
                News.findById(req.params.id).exec(callback);
            }
        }, async function (err, results) {
            if (err) { return next(err); }
            else {
                var news1 = new News({
                    title: req.body.newstitle,
                    typenews: req.body.newstype,
                    content: req.body.newscontent,
                    date: req.body.newsdate,
                    _id: req.params.id
                });
                try {
                    //Thực hiện update, bỏ dữ liệu từ poketype1 đã nhập vào 
                    transaction.update('News', results.news._id, news1);
                    //Thực hiện trans
                    await transaction.run();

                    res.redirect('/admin/news');
                } catch (error) {
                    console.log('Lỗi')
                    console.error(error);
                    transaction.rollback().catch(console.error);
                    transaction.clean();
                    res.render('admin/news_form', { title: 'Sửa Pokemon Stop', news: req.body });
                }
            }
        })
    }
]
