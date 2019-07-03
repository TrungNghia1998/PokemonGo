var Account = require('../models/account');
var Character = require('../models/character')
var crypto = require('crypto-js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
const Transaction = require('mongoose-transactions');
const transaction = new Transaction();
var paypal = require('paypal-rest-sdk');
// import { NganLuong } from 'vn-payments';
// const TEST_CONFIG = NganLuong.TEST_CONFIG;

var nganluong = require('vn-payments');
var express = require('express');
var router = express.Router();
var braintree = require('braintree');

//PAYPAL
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ActchI8-mOkbSuzdo4Z1yCGR8XEmXFBysSBU7EX0ffgUotzAPAG84psfLDFIIYmGiIJ8RbRN-eoEpNGK',
    'client_secret': 'EIV3WVJIh5IICE5QunUHfmHNt5je_rj_I3DupDRdWJy9LXPUmnor8CNRerMJSCAfWY-UKGJmuAB7opy-'
});



//-------------------------------DÀNH CHO ADMIN --------------------------------
//Hiển thị danh sách tất cả tài khoản.
exports.account_list = function (req, res, next) {
    let msg = req.query.msg == undefined ? 'Tất cả tài khoản đều ở đây...cẩn thận!' : req.query.msg;
    Account.find().populate('characterid')
        .exec(function (err, list_accounts) {
            if (err) { return next(err); }
            //Thành công, render nó
            res.render('admin/account_list', {
                title: 'Quản lý tài khoản | Admin - MiddleField',
                name: req.user.username, account_list: list_accounts, msg: msg
            });
        });
};

// Xử lý tạo tài khoản bằng POST dành cho admin.
exports.account_create_post_admin = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    // body('fullname').not().isNumeric().withMessage('Tên người dùng phải là chữ cái'),
    // body('email').isEmail().withMessage('Email không hợp lệ.'),
    // body('phone').isLength({ max: 10 }).trim().withMessage('Số điện thoại không quá 10 số')
    //     .isNumeric().withMessage('Số điện thoại là số.'),
    body('username').isLength({ min: 1 }).withMessage('Tên tài khoản không hợp lệ.'),
    body('password').isLength({ min: 8, max: 20 }).withMessage('Mật khẩu phải có độ dài từ 8 - 20 ký tự'),
    body('password_cfm').custom((value, { req }) => {
        if (value !== req.body.password) { throw new Error('Mật khẩu xác nhận không chính xác') }
        else { return true; }
    }),
    body('cash').isLength({ min: 1 }).trim().withMessage('Tiền không hợp lệ')
        .isNumeric().withMessage('Tiền phải là số'),
    body('acctype').isBoolean().withMessage('Dữ liệu không hợp lệ'),

    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {

        // Gom lỗi trong request bỏ vô errors.
        //Dữ liệu hợp lệ
        //Kiểm tra xem tài khoản tồn tại chưa
        async.parallel({
            found_account: function (callback) {
                Account.findOne({ 'username': req.body.username }).exec(callback);
            }
        }, async function (err, results) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                var err = ''
                errors.array().forEach(element => {
                    err += element.msg + ". ";
                });
                res.redirect(`/admin/accounts?msg=` + encodeURI(err));
                return;
            }
            if (err) next(err)
            if (results.found_account) {
                //Tài khoản đã tồn tại, chuyển về trang chi tiết tài khoản đó
                res.redirect(`/admin/accounts?msg=` + encodeURI("Tài khoản đã tồn tại"));
            }
            else {
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var account = new Account({
                    fullname: req.body.fullname == undefined ? null : req.body.fullname,
                    email: req.body.email == undefined ? null : req.body.email,
                    phone: req.body.phone == undefined ? null : req.body.phone,
                    address: req.body.address == undefined ? null : req.body.address,
                    phone: req.body.phone == undefined ? null : req.body.phone,
                    username: req.body.username,
                    password: crypto.HmacSHA1(req.body.password, new String(req.body.username + req.body.password).toUpperCase()).toString(),
                    cash: req.body.cash == undefined ? 0 : req.body.cash,
                    exchangelog: new Array(),
                    createdate: new Date(),
                    acctype: req.body.acctype,
                    status: req.body.status
                });
                try {
                    transaction.insert('Account', account);
                    await transaction.run().then(() => {
                        res.redirect(`/admin/accounts?msg=` + encodeURI("Tạo tài khoản thành công"));
                    });

                } catch (err) {
                    transaction.rollback();
                    transaction.clean();
                    res.redirect(`/admin/accounts?msg=` + encodeURI("Tạo tài khoản thất bại (DB)"));
                }
            }
        });
    }
];

// Hiển thị form khóa tài khoản bằng GET.
exports.account_lock_post = function (req, res, next) {
    async.parallel({
        account: function (callback) {
            Account.findById(req.params.id).exec(callback);
        },
        list_accounts: function (callback) {
            Account.find().exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        results.account.status = false
        //Thành công
        try {
            transaction.update('Account', results.account._id, results.account);
            await transaction.run().then(() => {
                res.redirect(`/admin/accounts?msg=` + encodeURI("Khóa tài khoản thành công"));
            })
            // Account.find().exec(function (err, data) {
            //     res.render('admin/account_list', {
            //         title: 'Quản lý tài khoản | Admin - MiddleField',
            //         name: req.user.username, account_list: data,
            //         msg: "Khóa tài khoản thành công"
            //     });
            // });
        } catch (err) {
            transaction.rollback();
            transaction.clean();
            res.redirect(`/admin/accounts?msg=` + encodeURI("Khóa tài khoản thất bại (DB)"));
        }
    })
};

// mở khóa.
exports.account_unlock_post = function (req, res) {
    async.parallel({
        account: function (callback) {
            Account.findById(req.params.id).exec(callback);
        },
        list_accounts: function (callback) {
            Account.find().exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        results.account.status = true
        //Thành công
        try {
            transaction.update('Account', results.account._id, results.account);
            await transaction.run().then(() => {
                res.redirect(`/admin/accounts?msg=` + encodeURI("Mở khóa tài khoản thành công"));
            })

        } catch (err) {
            transaction.rollback();
            transaction.clean();
            res.redirect(`/admin/accounts?msg=` + encodeURI("Mở khóa tài khoản thất bại (DB)"));
        }
    })
};


// Xử lý cập nhật tài khoản bằng POST.
exports.account_update_post_admin = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('cash').isLength({ min: 1 }).trim().withMessage('Tiền không hợp lệ')
        .isNumeric().withMessage('Tiền phải là số'),
    body('acctype').isBoolean().withMessage('Dữ liệu không hợp lệ'),

    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    (req, res, next) => {

        //Extract the validation errors from a request.
        const errors = validationResult(req);
        //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
        //Trả lại dữ liệu account
        if (!errors.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            var err = ''
            errors.array().forEach(element => {
                err += element.msg + ". ";
            });
            res.redirect(`/admin/accounts?msg=` + encodeURI(err));
            return;
        }
        if (req.body.password != req.body.password_cfm) {
            res.redirect(`/admin/accounts?msg=` + encodeURI("Mật khẩu xác nhận không giống"));
        }
        async.parallel({
            account: function (callback) {
                Account.findById(req.params.id).exec(callback);
            }
        }, async function (err, results) {
            if (err) { next(err); }
            // res.render('admin/account_list', { title: 'Cập nhật tài khoản', account: results.account, errors: errors.array() });
            //Tạo đối tượng account với dữ liệu mới và id cũ
            var temp = new Account({
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                phone: req.body.phone,
                // username: req.body.username,
                password: req.body.password != undefined ? crypto.HmacSHA1(req.body.password, new String(results.account.username + req.body.password).toUpperCase()).toString()
                    : results.account.password,
                cash: req.body.cash,
                acctype: req.body.acctype,
                // status: req.body.status,
                _id: req.params.id  //id trong request đây
            });


            //Dữ liệu trong form hợp lệ. Cập nhật ngay và luôn
            try {
                transaction.update('Account', req.params.id, temp);
                await transaction.run().then(() => {
                    res.redirect(`/admin/accounts?msg=` + encodeURI("Cập nhật tài khoản thành công"));

                })

            } catch (err) {
                // err = [{ params: 'transError', msg: 'Lỗi khi save database' }]  
                transaction.rollback();
                transaction.clean();
                res.redirect(`/admin/accounts?msg=` + encodeURI("Cập nhật tài khoản thất bại (DB)"));
            }
        });
    }
]

//======================================DÀNH CHO USER============================================
//Xem thông tin tài khoản user
exports.account_detail_get_user = function (req, res, next) {
    async.parallel({
        account: function (callback) {
            Account.findById(req.user._id)
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.account == null) {  //Tài khoản không tồn tại
            var err = new Error('Không tìm thấy tài khoản');
            err.startus = 404;
            return next(err);
        }
        //Tìm thấy tài khoản, triển ngay
        res.render('account/profile', { title: 'Quản lý tài khoản', account: results.account });
    });
}

exports.account_update_post_user = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('fullname').not().isNumeric().withMessage('Tên người dùng phải là chữ cái'),
    body('email').isEmail().withMessage('Email không hợp lệ.'),
    body('phone').isLength({ max: 10 }).trim().withMessage('Số điện thoại không quá 10 số')
        .isNumeric().withMessage('Số điện thoại là số.'),
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {

        //Extract the validation errors from a request.
        const errors = validationResult(req); async.parallel({
            account: function (callback) {
                Account.findById(req.params.id).exec(callback);
            }
        }, async function (err, results) {
            if (!errors.isEmpty()) {
                //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
                //Trả lại dữ liệu account
                if (err) { return next(err); }
                res.render('account/profile', { account: results.account, errors: errors.array() });
                return;
            }
            //Tạo đối tượng account với dữ liệu mới và id cũ
            var account = new Account({
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                phone: req.body.phone,
                username: results.account.username,
                password: results.account.password,
                cash: results.account.cash,
                typeacc: results.account.typeacc,
                status: results.account.status,
                _id: results.account._id  //id trong request đây
            });
            //Dữ liệu trong form hợp lệ. Cập nhật ngay và luôn
            try {
                transaction.update('Account', account._id, account);
                await transaction.run().then(() => {
                    Account.findById(req.params.id).exec((err, data) => {
                        if (err) return next(err);
                        transaction.clean();
                        res.render('account/profile', { account: data, success: 'Thay đổi thông tin thành công!' });
                    })
                })
            } catch (err) {
                console.log(err)
                err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                res.render('account/profile', { account: account, errors: err });
                transaction.rollback();
                transaction.clean();
            }

        })
    }

]


exports.account_changepwd_post_user = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('password_new').isLength({ min: 8, max: 20 }).withMessage('Mật khẩu phải có độ dài từ 8 - 20 ký tự'),
    body('password_cfm').custom((value, { req }) => {
        if (value !== req.body.password) { throw new Error('Mật khẩu xác nhận không chính xác'); }
        else { return true; }
    }),
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {

        //Extract the validation errors from a request.
        const errors = validationResult(req); async.parallel({
            account: function (callback) {
                Account.findById(req.params.id).exec(callback);
            }
        }, async function (err, results) {
            if (!errors.isEmpty()) {
                //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
                //Trả lại dữ liệu account
                if (err) { return next(err); }
                res.render('account/profile', { account: results.account, errors: errors.array() });
                return;
            }
            var pwdcurEncrypt = crypto.HmacSHA1(req.body.password_cur, new String(results.account.username + req.body.password_cur).toUpperCase()).toString()
            if (pwdcurEncrypt != results.account.password) {
                var err = [{ params: 'pwdcurError', msg: 'Mật khẩu hiện tại không đúng!' }]
                res.render('account/profile', { account: results.account, errors: err });
                return;
            }
            //Tạo đối tượng account với dữ liệu mới và id cũ
            var account = results.account;
            account.password = crypto.HmacSHA1(req.body.password_new, new String(account.username + req.body.password_new).toUpperCase()).toString()
            //Dữ liệu trong form hợp lệ. Cập nhật ngay và luôn
            try {
                transaction.update('Account', account._id, account);
                await transaction.run().then(() => {
                    Account.findById(req.params.id).exec((err, data) => {
                        if(err) return next(err);
                        transaction.clean();
                        res.render('account/profile', { account: data, success: 'Đổi mật khẩu thành công!' });
                    });
                });
            } catch (err) {
                console.log(err);
                err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                res.render('account/profile', { account: results.account, errors: err });
                transaction.rollback();
                transaction.clean();
            }

        })
    }
]


// Hiển thị form tạo tài khoản bằng GET dành cho user.
// exports.account_create_get_user = function (req, res) {
//     res.render('account/create', { title: 'Tạo tài khoản' });
// };

//Hoàng
exports.account_create_get_user = function (req, res) {
    res.render('account/login', { title: 'Tạo tài khoản' });
};

// Xử lý tạo tài khoản bằng POST dành cho user.
exports.account_create_post_user = [
    body('username').isLength({ min: 1 }).withMessage('Tên tài khoản không hợp lệ.'),
    body('password').isLength({ min: 8, max: 20 }).withMessage('Mật khẩu phải có độ dài từ 8 - 20 ký tự'),
    body('password_cfm').custom((value, { req }) => {
        if (value == req.body.password) return true;
        else { throw new Error('Mật khẩu xác nhận không chính xác') }
    }),

    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),
    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {
        const errors = validationResult(req);
        // Gom lỗi trong request bỏ vô errors.
        if (!errors.isEmpty()) {
            var msg = '';
            errors.array().forEach(e => {
                msg += e.msg + `. \\n`;
            })
            res.render('account/login', { title: 'Đăng nhập', errors: msg });
        }
        else {
            //Dữ liệu hợp lệ
            //Kiểm tra xem tài khoản tồn tại chưa
            Account.findOne({ 'username': req.body.username })
                .exec(async function (err, found_account) {
                    if (found_account) {
                        //Tài khoản đã tồn tại, chuyển về trang chi tiết tài khoản đó4
                        var err = [{ params: 'accountExist', msg: 'Tài khoản đã tồn tại' }]
                        res.render('account/login', { title: 'Tạo tài khoản', errors: err.msg });
                    }
                    else {
                        //Tạo tài khoản với dữ liệu đã được "sạch".
                        var account = new Account({
                            fullname: req.body.fullname != null ? req.body.fullname : null,
                            email: req.body.email != null ? req.body.email : null,
                            phone: req.body.phone != null ? req.body.phone : null,
                            address: req.body.address != null ? req.body.phone : null,
                            username: req.body.username,
                            password: crypto.HmacSHA1(req.body.password, new String(req.body.username + req.body.password).toUpperCase()).toString(),
                            cash: 0,
                            exchangelog: new Array(),
                            createdate: new Date(),
                            acctype: false,
                            status: true
                        });
                        try {
                            transaction.insert('Account', account);
                            await transaction.run().then(() => {
                                res.render('account/login', { title: 'Tạo tài khoản', errors: "Đăng ký tài khoản thành công." });

                            })
                            //res.redirect('/account');
                            // res.status(200).json({ status: true });
                        } catch (err) {
                            console.log(err);
                            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                            res.render('account/login', { title: 'Tạo tài khoản', errors: "Đăng ký tài khoản thất bại (DB)" });

                            transaction.rollback();
                            transaction.clean();
                        }
                    }
                });
        }
    }
];

//Nghĩa lưu tài khoản
exports.saveAccount = function (req, res) {
    Account.findOne({ 'username': req.body.accountname })
        .exec(async function (err, found_account) {
            if (found_account) {
                //Tài khoản đã tồn tại, chuyển về trang chi tiết tài khoản đó4
                //var err = [{ params: 'accoutnExist', msg: 'Tài khoản đã tồn tại' }]
                // res.render('account/create', { title: 'Tạo tài khoản', account: req.body, errors: err });
                res.status(200).json({ status: false });
            }
            else {
                //Tạo tài khoản với dữ liệu đã được "sạch".
                var account = new Account({
                    fullname: req.body.fullname != null ? req.body.fullname : null,
                    email: req.body.email != null ? req.body.email : null,
                    phone: req.body.phone != null ? req.body.phone : null,
                    address: req.body.address != null ? req.body.phone : null,
                    username: req.body.accountname,
                    password: crypto.HmacSHA1(req.body.password, new String(req.body.username + req.body.password).toUpperCase()).toString(),
                    cash: 0,
                    createdate: new Date(),
                    acctype: req.body.statusAccountType,
                    status: req.body.status
                });
                try {
                    transaction.insert('Account', account);
                    await transaction.run()
                    //res.redirect('/account');
                    res.status(200).json({ status: true });
                } catch (err) {
                    err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                    res.status(200).json({ status: false });
                    //res.render('account_form', { title: 'Tạo tài khoản', account: req.body, errors: errors.array() });
                    transaction.rollback();
                    transaction.clean();
                }
            }
        });
}

//Nghĩa
exports.deleteAccount = function (req, res) {
    async.parallel({
        account: function (callback) {
            Account.findById(req.body.id).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        //Thành công
        try {
            transaction.remove('Account', results.account._id);
            await transaction.run()
            res.status(200).json({ status: true });
        } catch (err) {
            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
            res.render('admin/account_delete', { title: 'Xóa tài khoản', account: req.body, errors: errors.array() });
            transaction.rollback();
            transaction.clean();
        }
    })
}

//xử lí POST chuyển CASH => GEM
exports.exchange_cash = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('amount').isNumeric().withMessage('Số lượng phải là số!'),
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {

        //Extract the validation errors from a request.
        const errors = validationResult(req);
        async.parallel({
            account: function (callback) {
                Account.findById(req.user._id).exec(callback);
            },
            character: function (callback) {
                Character.findOne({ accountid: req.user._id }).exec(callback);
            }
        }, async function (err, results) {
            if (!errors.isEmpty()) {
                //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
                //Trả lại dữ liệu account
                if (err) {
                    return next(err);
                }
                res.render('account/profile', { account: results.account, errors: errors.array() });
                return;
            }
            if (parseInt(req.body.amount) > parseInt(results.account.cash)) {
                var err = [{ params: 'pwdcurError', msg: 'Số lượng CASH không đủ để chuyển! Vui lòng nạp thêm' }]
                res.render('account/profile', { account: results.account, errors: err });
                return;
            }
            else {
                results.account.exchangelog.push({ amount: req.body.amount, date: new Date() })
                results.account.cash -= parseInt(req.body.amount);
                results.character.gem += parseInt(req.body.amount);
                //Dữ liệu trong form hợp lệ. Cập nhật ngay và luôn
                try {
                    transaction.update('Account', results.account._id, results.account);
                    transaction.update('Character', results.character._id, results.character)
                    await transaction.run()
                    res.render('account/profile', { account: results.account, success: 'Chuyển thành công!' });
                } catch (err) {
                    err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                    res.render('account/profile', { account: results.account, errors: err });
                    transaction.rollback();
                    transaction.clean();
                }
            }
        })
    }
]

//xử lí POST nạp CASH thẻ Mcash
exports.recharge_cash = [
    //Đảm bảo các thông tin nhập vào phải hợp lệ.
    body('seri').isNumeric().withMessage('Số thẻ không hợp lệ!'),
    body('number').isNumeric().withMessage('Mã nạp thẻ không hợp lệ!'),
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {
        var MCard = require('../models/mcard.js')
        var RechargeLog = require('../models/rechargelog')
        //Extract the validation errors from a request.
        const errors = validationResult(req); async.parallel({
            account: function (callback) {
                Account.findById(req.user._id).exec(callback);
            },
            mcard: function (callback) {
                MCard.findOne({ seri: req.body.seri }).exec(callback);
            }
        }, async function (err, results) {
            if (!errors.isEmpty()) {
                //Nếu có lỗi. Chạy lại form với thông báo lỗi và dữ liệu bị làm "sạch"
                //Trả lại dữ liệu account
                if (err) {
                    return next(err);
                }
                res.render('account/profile', { account: results.account, errors: errors.array() });
                return;
            }
            if (results.mcard && results.mcard.number == req.body.number) {
                if (results.mcard.status == true) {
                    var err = [{ params: 'pwdcurError', msg: 'Thẻ đã được sử dụng!' }]
                    res.render('account/profile', { account: results.account, errors: err });
                    return;
                }

                results.account.cash += parseInt(results.mcard.value) / 1000
                results.mcard.status = true;
                var rechargelog = new RechargeLog({
                    accountid: results.account._id,
                    amount: parseInt(results.mcard.value),
                    date: new Date(),
                    method: "MCARD",
                    status: true
                })


                try {
                    transaction.update('Account', results.account._id, results.account);
                    transaction.update('MCard', results.mcard._id, results.mcard);
                    transaction.insert('RechargeLog', rechargelog)
                    transaction.run()
                    res.render('account/profile', { account: results.account, success: 'Nạp thẻ thành công!' });
                } catch (err) {
                    err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                    res.render('account/profile', { account: results.account, errors: err });
                    transaction.rollback();
                    transaction.clean();
                }
            }
            else {
                var err = [{ params: 'pwdcurError', msg: 'Vui lòng nhập đúng thông tin thẻ!' }]
                res.render('account/profile', { account: results.account, errors: err });
                return;
            }

        })
    }
]

//xử lí POST nạp CASH bằng Paypal
exports.recharge_cash_paypal = [
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {
        var host = req.headers.host
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://" + host + "/account/rechargepaypal/" + req.body.price + "/success",
                "cancel_url": "http://" + host + "/account/"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "CASH x " + req.body.product + " (bonus " + Math.floor(parseInt(req.body.product) / 10) + ")",
                        "sku": "cash" + req.body.product,
                        "price": req.body.price,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": req.body.price
                },
                "description": "Thanh toán nạp CASH x " + req.body.product
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                next(error)
            } else {
                console.log(payment)
                var uuid = require('uuid/v4')
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href)
                    }
                }
            }
        });
    }
]

//xử lí POST nạp CASH bằng Braintree
exports.recharge_cash_braintree = [
    sanitizeBody('*').escape(),
    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {
        var gateway = braintree.connect({
            environment: braintree.Environment.Sandbox,
            // Use your own credentials from the sandbox Control Panel here
            merchantId: 'vvn2wqk72jbtn36f',
            publicKey: 'knnsgkvjgspncqqb',
            privateKey: 'aa95d19512d67fbffbc2b2114880688c'
        });

        // Use the payment method nonce here
        // Create a new transaction for $10
        var newTransaction = gateway.transaction.sale({
            amount: req.body.price,
            paymentMethodNonce: 'nonce-from-the-client',
            options: {
                // This option requests the funds from the transaction
                // once it has been authorized successfully
                submitForSettlement: true
            }
        }, function (error, result) {
            if (result.success == true) {
                var RechargeLog = require('../models/rechargelog');
                Account.findOne({ '_id': req.user._id })
                    .exec(async function (err, account) {
                        if (err) { throw err; }
                        RechargeLog.find().exec(async function (err, data) {
                            if (err) { throw err }
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].paymentid == result.transaction.id) {
                                    res.render('account/profile', { account: account });
                                    return;
                                }
                            }
                            var cash = 0
                            switch (parseFloat(req.body.price)) {
                                case 0.99:
                                    cash = 23 + 2
                                    break
                                case 9.99:
                                    cash = 230 + 23
                                    break
                                case 99.99:
                                    cash = 2300 + 230
                                    break
                                case 999.99:
                                    cash = 23000 + 2300
                                    break
                                default:
                                    cash = 230000 + 23000
                                    break
                            }
                            account.cash += cash
                            var rechargelog = new RechargeLog({
                                accountid: account._id,
                                amount: parseFloat(req.body.price),
                                date: new Date(),
                                method: "BRAINTREE",
                                paymentid: result.transaction.id,
                                status: true
                            })
                            try {
                                transaction.update('Account', account._id, account);
                                transaction.insert('RechargeLog', rechargelog)
                                await transaction.run();
                                res.render('account/profile', { account: account, success: 'Thanh toán thành công!' });
                            } catch (err) {
                                console.log(err)
                                err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                                res.render('account/profile', { account: account, errors: err });
                                transaction.rollback();
                                transaction.clean();
                            }
                        })
                    })
                // res.send(result);
            } else {
                Account.findOne({ '_id': req.user._id })
                    .exec(async function (err, account) {
                        res.render('account/profile', { account: account, success: `Thanh toán thất bại` })
                    });
            }
        });
    }
]

//xử lí POST nạp CASH bằng Ngân lượng
exports.recharge_cash_nganluong = [
    sanitizeBody('*').escape(),

    //Hợp lệ và sạch rồi thì triển thôi
    async (req, res, next) => {
        console.log(req);
    }
]

//Xử lý thanh toán khi Paypal thành công
exports.recharge_cash_paypal_success = function (req, res, next) {
    var RechargeLog = require('../models/rechargelog')
    Account.findOne({ '_id': req.user._id })
        .exec(async function (err, account) {
            if (err) { throw err; }
            const payerId = req.query.PayerID
            const paymentId = req.query.paymentId
            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": req.params.price
                    }
                }]
            }
            paypal.payment.execute(paymentId, execute_payment_json, function (err, payment) {
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    RechargeLog.find().exec(function (err, data) {
                        if (err) { throw err }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].paymentid == payment.id) {
                                res.render('account/profile', { account: account });
                                return;
                            }
                        }

                        console.log(payment)
                        var cash = 0
                        switch (parseFloat(req.params.price)) {
                            case 0.99:
                                cash = 23 + 2
                                break
                            case 9.99:
                                cash = 230 + 23
                                break
                            case 99.99:
                                cash = 2300 + 230
                                break
                            case 999.99:
                                cash = 23000 + 2300
                                break
                            default:
                                cash = 230000 + 23000
                                break
                        }
                        account.cash += cash
                        var rechargelog = new RechargeLog({
                            accountid: account._id,
                            amount: parseFloat(req.params.price),
                            date: new Date(),
                            method: "PAYPAL",
                            paymentid: payment.id,
                            status: true
                        })
                        try {
                            transaction.update('Account', account._id, account);
                            transaction.insert('RechargeLog', rechargelog)
                            transaction.run()
                            res.render('account/profile', { account: account, success: 'Thanh toán thành công!' });
                        } catch (err) {
                            console.log(err)
                            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                            res.render('account/profile', { account: account, errors: err });
                            transaction.rollback();
                            transaction.clean();
                        }
                    })
                }
            })
        })
}
