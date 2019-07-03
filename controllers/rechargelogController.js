var RechargeLog = require('../models/rechargelog');
var Account = require('../models/account');
var async = require('async')
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()
//Hiển thị danh sách tất cả lịch sử nạp tiền.
exports.rechargelog_list = function (req, res) {
    RechargeLog.find({}, 'accountid amount date method status')
        .populate('accountid')
        .exec(function (err, list) {
            if (err) { return next(err); }
            res.render('admin/rechargelog_list', { title: 'Danh sách nạp thẻ', rechargelog_list: list });
        });
};

// Hiển thị thông tin chi tiết lịch sử nạp tiền.
exports.rechargelog_detail = function (req, res) {
    async.parallel({
        rechargelog: function (callback) {
            RechargeLog.findById(req.params.id)
                .populate('accountid')
                .exec(callback);
        }
    }, function (err, result) {
        if (err) { return next(err); }
        if (result.rechargelog == null) {
            var err = new Error('Không có loại Pokemon nào');
            err.status = 404;
            return next(err);
        }
        res.render('admin/rechargelog_detail', { title: 'Chi tiết nạp thẻ', rechargelog: result.rechargelog });
    })
};

// Hiển thị form tạo lịch sử nạp tiền bằng GET.
exports.rechargelog_create_get = function (req, res) {
    async.parallel({
        accounts: function (callback) {
            Account.find()
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('admin/recharge_form', { title: 'Tạo pokemon', accounts: results.accounts });
    })
};

// Xử lý tạo lịch sử nạp tiền bằng POST.
exports.rechargelog_create_post = [
    //Rau sạch
    body('rechargeamount').isLength({ min: 1 }).withMessage('Số tiền không hợp lệ.'),
    body('rechargemethod').isLength({ min: 1 }).withMessage('Loại giao dịch không hợp lệ.'),

    //Dữ liệu sạch
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        // Gom lỗi trong request bỏ vô errors.
        const error = validationResult(req);
        if (!error.isEmpty()) {
            async.parallel({
                accounts: function (callback) {
                    Account.find()
                        .exec(callback);
                }
            }, function (err, results) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/recharge_form', { title: 'Tạo Pokemon', rechargelog: req.body, accounts: results.accounts, errors: error.array() });
            })
        }
        else {
            async.parallel({
                accounts: function (callback) {
                    Account.find()
                        .exec(callback);
                }
            }, async function (err, results) {
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var rechargelog = new RechargeLog({
                    accountid: req.body.rechargeaccname,
                    amount: req.body.rechargeamount,
                    date: req.body.rechargedate,
                    method: req.body.rechargemethod,
                    status: req.body.rechargestatus
                });
                try {
                    //Tạo biến poketype trong bảng Poketype
                    transaction.insert('RechargeLog', rechargelog);
                    //Thực hiện trans
                    await transaction.run();
                    res.redirect('/admin/rechargelogs');
                } catch (error) {
                    //Nếu có lỗi thì xuất lỗi, rollback.
                    console.error(error);
                    transaction.rollback().catch(console.error);
                    transaction.clean(); //éo phải lỗi ở đây
                    res.render('admin/recharge_form', { title: 'Tạo giao dịch', rechargelog: req.body, accounts: results.accounts });
                }
            }
            )
        }
    }
];

// Hiển thị form xóa lịch sử nạp tiền bằng GET.
exports.rechargelog_delete_get = function (req, res,next) {
    async.parallel({
        rechargelog: function (callback) {
            RechargeLog.findById(req.params.id)
                .populate('accountid')
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.rechargelog == null) {  //ko lỗi
            res.redirect('/admin/rechargelogs');
        }
        //Thành công
        res.render('admin/recharge_delete', { title: 'Xóa vật phẩm', rechargelog: results.rechargelog });
    })
};

// Xử lý xóa lịch sử nạp tiền bằng POST.
exports.rechargelog_delete_post = function (req, res) {
    async.parallel({
        rechargelog: function (callback) {
            RechargeLog.findById(req.body.rechargeid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        else {
            try {
                //Nếu k có lỗi thì xóa poketype có _id như results ở trên
                transaction.remove('RechargeLog', results.rechargelog._id);
                await transaction.run();
                res.redirect('/admin/rechargelogs')
            } catch (error) {
                console.error(error)
                transaction.rollback().catch(console.error)
                transaction.clean()
                res.render('admin/recharge_delete', { title: 'Xóa loại Pokemon', rechargelog: req.body })
            }
        }
    })
};

// Hiển thị cập nhật lịch sử nạp tiền bằng GET.
exports.rechargelog_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: RechargeLog update GET');
};

// Xử lý cập nhật lịch sử nạp tiền bằng POST.
exports.rechargelog_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: RechargeLog update POST');
};