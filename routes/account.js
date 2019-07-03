var express = require('express');
var router = express.Router();
var crypto = require('crypto-js');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Account = require('../models/account');
var accountID = null;

//Require controller modules.
var account_controller = require('../controllers/accountController');
var recharge_controller = require('../controllers/rechargelogController');

//PASSPORT Xử lý-------------------------------------
//hàm check password
var isValidPassword = function (user, password) {
    var pwdEcrypted = crypto.HmacSHA1(password, new String(user.username + password).toUpperCase()).toString();
    if (pwdEcrypted == user.password) return true;
    return false;
}
//check login
passport.use('account', new localStrategy(
    (username, password, done) => {
        Account.findOne({ 'username': username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(err, false, { message: 'Tài khoản hoặc mật khẩu sai!' });
            }
            if (!isValidPassword(user, password)) {
                return done(err, false, { message: 'Tài khoản hoặc mật khẩu sai!' });
            }
            if (user.status == false) {
                return done(err, false, { message: 'Tài khoản bị khóa!' })
            }
            return done(null, user);
        })
    }
))

//lưu cookie
passport.serializeUser((user, done) => {
    done(null, user)
})

//check cookie
passport.deserializeUser((user, done) => {
    Account.findOne({ 'username': user.username }, function (err, data) {
        if (err) { return done(err); }
        if (data) {
            if (data.acctype == true) data.role = 'admin';
            else data.role = 'user'
            return done(null, data);
        }
    })
})

//check login chưa
function isLogined(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/account/login')
}


//ACCOUNT ROUTES --------- (GET là lấy dữ liệu db, POST là để thay đổi dữ liệu lên db)
//GET - POST request đăng nhập
router.get('/login', (req, res) => {
    var message = req.flash('error')[0]
    res.render('account/login', { errors: message });
})

//Hoàng sửa /account/ -> /ingame
router.post('/login', passport.authenticate('account', {
    failureRedirect: '/account/login',  //login thất bại
    successRedirect: '/account',    //login thành công
    failureFlash: true
}))

//logout - clear cookie
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/account/login');
})



//GET - POST request để xem thông tin tài khoản
router.get('/', isLogined, account_controller.account_detail_get_user);

//GET - POST request để cập nhật tài khoản.
router.post('/:id/update', isLogined, account_controller.account_update_post_user);

//GET - POST request để đổi mật khẩu
router.post('/:id/changepwd', isLogined, account_controller.account_changepwd_post_user);

//GET - POST request để tạo tài khoản mới
router.get('/create', account_controller.account_create_get_user);
router.post('/create', account_controller.account_create_post_user)

//Hoàng
router.get('/login', isLogined, account_controller.account_create_get_user);
//router.post('/login', isLogined, account_controller.account_create_post_user);

// router.post('/register', account_controller.account_create_post_user);

// router.get('account/:id', account_controller.account_detail);

//POST đổi CASH sang GEM
router.post('/exchange', isLogined, account_controller.exchange_cash)

//POST nạp CASH bằng thẻ M-CASH
router.post('/recharge', isLogined, account_controller.recharge_cash)

//POST nạp CASH bằng Paypal
router.post('/rechargepaypal', isLogined, account_controller.recharge_cash_paypal)

//POST nạp CASH bằng Ngân lượng
router.post('/rechargenganluong', isLogined, account_controller.recharge_cash_nganluong)

//POST nạp CASH bằng BrainTree
router.post('/rechargebraintree', isLogined, account_controller.recharge_cash_braintree)

//GET nạp thành công
router.get('/rechargepaypal/:price/success', isLogined, account_controller.recharge_cash_paypal_success)

//Nghĩa
//router.get('Account/GetDetail', account_controller.account_get_detail);
module.exports = router;