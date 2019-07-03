var express = require('express');
var router = express.Router();
var crypto = require('crypto-js');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Account = require('../models/account');
var Character = require('../models/character');
//Require controller modules.
var character_controller = require('../controllers/characterController');
var ingame_controller = require('../controllers/ingameController');
var cashshop_controller = require('../controllers/cashshopController');
var pokemonposition_controller = require('../controllers/pokemonpositionController')
var pokestopposition_controller = require('../controllers/pokestoppositionController')
var bag_controller = require('../controllers/bagController')


//PASSPORT Xử lý-------------------------------------
//hàm check password
var isValidPassword = function (user, password) {
    var pwdEcrypted = crypto.HmacSHA1(password, new String(user.username + password).toUpperCase()).toString();
    if (pwdEcrypted == user.password) return true;
    return false;
}
//check login
passport.use('ingame', new localStrategy(
    (username, password, done) => {
        Account.findOne({ 'username': username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(err, false, { message: 'Tài khoản hoặc mật khẩu sai!' });
            }
            if (!isValidPassword(user, password)) {
                return done(err, false, { message: 'Mật khẩu hoặc mật khẩu sai!' });
            }
            if (user.status == false) {
                return done(err, false, { message: 'Tài khoản đã bị khóa. Vui lòng liên hệ ADMIN để biết thêm chi tiết!' })
            }
            return done(null, user);
        })
    }
))
//check login chưa
function isLogined(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/ingame/login')
}

//GET - POST request đăng nhập
router.get('/login', (req, res) => {
    var message = req.flash('error')[0];
    res.render('ingame/login', { title: "Đăng nhập", errors: message });
})

router.post('/login', passport.authenticate('ingame', {
    failureRedirect: '/ingame/login',  //login thất bại    
    successRedirect: '/ingame/',    //login thành công
    failureFlash: true
}))

//logout - clear cookie
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/ingame/login');
})

//GET-POST request ingame
router.get('/', isLogined, isCharacter, ingame_controller.index)

//check login chưa
function isLogined(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/ingame/login')
}

function isCharacter(req, res, next) {
    Character.findOne({ accountid: req.user._id }, function (err, data) {
        if (data != undefined)
            return next();

        res.redirect('/ingame/character/create');
    })
    // res.redirect('/ingame/character/create');
}

//GET thông tin nhân vật
router.get('/character', isLogined, ingame_controller.character_info)

//GET thông tin level
router.get('/level', isLogined, ingame_controller.level)

//GET pokemon
router.get('/pokemonposition', isLogined, ingame_controller.pokemonLoad)

//GET pokestop
router.get('/pokestopposition', isLogined, ingame_controller.pokestopLoad)

//GET cashshop
router.get('/cashshop', isLogined, ingame_controller.cashshopLoad)

//POST mua item trong cashshop
router.post('/buyitem', isLogined, cashshop_controller.cashshop_buy_post)

//POST bắt pokemon
router.post('/catch', isLogined, pokemonposition_controller.pokemon_catch)

//GET quay pokemon
router.get('/spin', isLogined, (req, res) => {
    res.render('ingame/catchtest');
})

//POST dùng vật phẩm hoặc vứt pokemon
router.post('/useitem', isLogined, bag_controller.bag_delete_post);

//POST quay pokestop
router.post('/spin', isLogined, pokestopposition_controller.spin_pokestop)

//GET - POST request để tạo nhân vật
router.get('/character/create', isLogined, character_controller.character_create_get_user);
router.post('/character/create', isLogined, character_controller.character_create_post_user);

//POST lấy tọa độ character
router.post('/setposcharacter', isLogined, ingame_controller.setting_pos_character)

//POST gửi follow
router.post('/follow', isLogined, character_controller.character_follow)

//POST vứt vật phẩm
router.post('/deleteitem', isLogined, bag_controller.bag_delete_post)

//GET pokemon server
router.get('/pokemonserver', ingame_controller.pokemon_server)

//GET transhistory
router.get('/transhistory', isLogined, ingame_controller.transaction_history)

//Xuất module
module.exports = router;