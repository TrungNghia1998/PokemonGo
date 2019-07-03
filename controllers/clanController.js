var Clan = require('../models/clan');
var Image = require('../models/image');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
const Transaction = require('mongoose-transactions')
const transaction = new Transaction()

//Hiển thị danh sách tất cả clan.
exports.clan_list = function (req, res) {

    Clan.find({}, 'name logo')
        .populate('logo')
        .exec(function (err, list_clans) {
            if (err) { return next(err); }
            console.log(list_clans);
            //Thành công, render nó
            res.render('admin/clan_list', { title: 'Danh sách clan', clan_list: list_clans });
        });

};

// Hiển thị thông tin chi tiết clan.
exports.clan_detail = function (req, res, next) {

    async.parallel({
        clan: function (callback) {
            Clan.findById(req.params.id)
                .populate('logo')
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.clan == null) {  //Nhân vật ko tồn tại
            var err = new Error('Không tìm thấy clan');
            err.startus = 404;
            return next(err);
        }
        //Tìm thấy tài khoản, triển ngay
        res.render('admin/clan_detail', { title: 'Chi tiết clan', clan: results.clan });
    });

};

// Hiển thị form tạo clan bằng GET.
exports.clan_create_get = function (req, res, next) {

    async.parallel({
        image: function (callback) {
            Image.find({ 'value': /clan/i }).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('admin/clan_form', { title: 'Tạo Clan', images: results.image });
    })

};

// Xử lý tạo clan bằng POST.
exports.clan_create_post = [
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {

        // Gom lỗi trong request bỏ vô errors.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //Có lỗi. Trả về là có lỗi với thông báo ở trên.
            res.render('admin/clan_form', { title: 'Tạo clan', clan: req.body, errors: errors.array() });
        }
        else {
            //Dữ liệu hợp lệ
            Clan.findOne({ 'name': req.body.name })
                .populate('logo')
                .exec(async function (err, found_clan) {
                    console.log(found_clan)
                    if (found_clan) {
                        async.parallel({
                            image: function (callback) {
                                Image.find({ 'value': /clan/i }).exec(callback)
                            }
                        }, function (err, results) {
                            //clan đã tồn tại
                            err = [{ params: 'transError', msg: 'Clan đã tồn tại' }]
                            res.render('admin/clan_form', { title: 'Tạo clan', images: results.image, clan: req.body, errors: errors.array() });
                            transaction.rollback();
                            transaction.clean();
                        })
                    }
                    else {
                        var clan = new Clan({
                            name: req.body.name,
                            logo: req.body.logo
                        });
                        try {
                            transaction.insert('Clan', clan);
                            await transaction.run()
                            res.redirect(clan.url);
                        } catch (err) {
                            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                            res.render('admin/clan_form', { title: 'Tạo clan', clan: req.body, errors: errors.array() });
                            transaction.rollback();
                            transaction.clean();
                        }
                    }
                })
        }

    }
]

// Hiển thị form xóa clan bằng GET.
exports.clan_delete_get = function (req, res) {

    async.parallel({
        clan: function (callback) {
            Clan.findById(req.params.id).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.clan == null) {  //ko lỗi
            res.redirect('/admin/clans');
        }
        //Thành công
        res.render('admin/clan_delete', { title: 'Xóa clan', clan: results.clan });
    })

};

// Xử lý xóa clan bằng POST.
exports.clan_delete_post = function (req, res) {

    async.parallel({
        clan: function (callback) {
            Clan.findById(req.body.clanid).exec(callback);
        }
    }, async function (err, results) {
        if (err) { return next(err); }
        //Thành công
        try {
            transaction.remove('Clan', results.clan._id);
            await transaction.run()
            res.redirect('/admin/clans');
        } catch (err) {
            err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
            res.render('admin/clan_delete', { title: 'Xóa clan', clan: results.clan });
            transaction.rollback();
            transaction.clean();
        }
    })

};

// Hiển thị cập nhật clan bằng GET.
exports.clan_update_get = function (req, res, next) {

    async.parallel({
        clan: function (callback) {
            Clan.findById(req.params.id)
                .populate('logo').exec(callback);
        },
        image: function (callback) {
            Image.find({ 'value': /clan/i }).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.clan == null) {  //tài khoản ko tồn tại
            var err = new Error('Clan không tồn tại');
            err.status = 404;
            return next(err);
        }
        //Thành công
        res.render('admin/clan_form', { title: 'Cập nhật tài khoản', clan: results.clan, images: results.image });
    })

};

// Xử lý cập nhật clan bằng POST.
exports.clan_update_post = [
    //Đảm bảo dữ liệu nhập vào là "sạch"
    sanitizeBody('*').escape(),

    //Xử lý request khi các thông tin đã đạt chuẩn.
    (req, res, next) => {

        async.parallel({
            clan: function (callback) {
                Clan.findById(req.params.id)
                    .populate('logo').exec(callback);
            },
            image: function (callback) {
                Image.find().exec(callback)
            }
        }, async function (err, results) {
            if (err) return next(err)
            // Gom lỗi trong request bỏ vô errors.
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                //Có lỗi. Trả về là có lỗi với thông báo ở trên.
                res.render('admin/clan_form', { title: 'Cập nhật clan', images: results.image, clan: req.body, errors: errors.array() });
            }
            else {
                //Dữ liệu hợp lệ
                var clan = new Clan({
                    name: req.body.name,
                    logo: req.body.logo,
                    _id: results.clan._id
                });

                try {
                    transaction.update('Clan', results.clan._id, clan);
                    await transaction.run()
                    res.redirect(clan.url);
                } catch (err) {
                    err = [{ params: 'transError', msg: 'Lỗi khi save database' }]
                    res.render('admin/clan_form', { title: 'Tạo clan', images: results.image, clan: req.body, errors: errors.array() });
                    transaction.rollback();
                    transaction.clean();
                }
            }
        })

    }
]
