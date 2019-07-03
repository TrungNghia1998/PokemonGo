var express = require('express');
var router = express.Router();
var crypto = require('crypto-js');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Account = require('../models/account');

//Require controller modules.
var account_controller = require('../controllers/accountController');
var bag_controller = require('../controllers/bagController');
var cashshop_controller = require('../controllers/cashshopController');
var character_controller = require('../controllers/characterController');
var clan_controller = require('../controllers/clanController');
var image_controller = require('../controllers/imageController');
var item_controller = require('../controllers/itemController');
var level_controller = require('../controllers/levelController');
var news_controller = require('../controllers/newsController');
var pokemon_controller = require('../controllers/pokemonController');
var pokemonposition_controller = require('../controllers/pokemonpositionController');
var pokestopposition_controller = require('../controllers/pokestoppositionController');
var poketradelog_controller = require('../controllers/poketradelogController');
var poketype_controller = require('../controllers/poketypeController');
var rechargelog_controller = require('../controllers/rechargelogController');
var admin_controller = require('../controllers/adminController');

//PASSPORT Xử lý-------------------------------------
//hàm check password
var isValidPassword = function (user, password) {
    var pwdEcrypted = crypto.HmacSHA1(password, new String(user.username + password).toUpperCase()).toString();
    if (pwdEcrypted == user.password) return true;
    return false;
}
//check login
passport.use('admin', new localStrategy(
    (username, password, done) => {
        Account.findOne({ 'username': username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(err, false, { message: 'Tài khoản hoặc mật khẩu không chính xác!' });
            }
            if (!isValidPassword(user, password)) {
                return done(err, false, { message: 'Tài khoản hoặc mật khẩu không chính xác!' });
            }
            if (user.acctype == false) {
                return done(err, false, { message: 'Bạn không có quyền truy cập vào trang này!' })
            }
            if (user.status == false) {
                return done(err, false, { message: 'Tài khoản bị khóa!' })
            }
            return done(null, user);
        })
    }
))

//check login chưa
function isLogined(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/admin/login')
}
//check role
function isAdmmin(req, res, next) {
    if (req.user.role == 'admin')
        return next();
    res.redirect('/admin/login')
}

//GET - POST request đăng nhập
router.get('/login', (req, res) => {
    var message = req.flash('error')[0]
    res.render('admin/login', { message: message });
})

router.post('/login', passport.authenticate('admin', {
    failureRedirect: '/admin/login',  //login thất bại
    successRedirect: '/admin/',    //login thành công
    failureFlash: true
}))


//logout - clear cookie
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin/login');
})

//Index
router.get('/', isLogined, isAdmmin, admin_controller.index);

//get all rechargelog
router.get('/rechargelogs/api', isLogined, isAdmmin, admin_controller.rechargelogAPI)

//GET là lấy dữ liệu db, POST là để thay đổi dữ liệu lên db
//ACCOUNT ROUTES -------------------------------------------------------------------
//GET - POST request để tạo tài khoản mới.
router.post('/account/create', isLogined, isAdmmin, account_controller.account_create_post_admin);
// router.post('/item/create', isLogined, isAdmmin, item_controller.item_create_post_admin);
//GET - POST request để lock-unlock tài khoản.
router.post('/account/:id/lock', isLogined, isAdmmin, account_controller.account_lock_post);
router.post('/account/:id/unlock', isLogined, isAdmmin, account_controller.account_unlock_post);

//GET - POST request để cập nhật tài khoản.
// router.get('/account/:id/update', isLogined, isAdmmin, account_controller.account_update_get_admin);
router.post('/account/:id/update', isLogined, isAdmmin, account_controller.account_update_post_admin);

// GET request để liệt kê danh sách tài khoản.
router.get('/accounts', isLogined, isAdmmin, account_controller.account_list);


//BAG ROUTES -------------------------------------------------------------------
//GET - POST request để xóa túi vật phẩm cho user
router.get('/bag/:id/delete/:idx/:type', isLogined, isAdmmin, bag_controller.bag_delete_get);
router.post('/bag/:id/delete/:idx/:type', isLogined, isAdmmin, bag_controller.bag_delete_post);

//POST request để thêm 1 item hoặc pokemon (admin + user)
router.post('/bag/:id/add', isLogined, isAdmmin, bag_controller.bag_add_post);

//GET - POST request để cập nhật túi vật phẩm (bao gồm thêm xóa sửa) cho admin
router.get('/bag/:id/update', isLogined, isAdmmin, bag_controller.bag_update_get_admin);
router.post('/bag/:id/update', isLogined, isAdmmin, bag_controller.bag_update_post_admin);

// GET request chi tiết túi vật phẩm (admin + user)
router.get('/bag/:id', isLogined, isAdmmin, bag_controller.bag_detail);

// GET request để liệt kê danh sách túi vật phẩm (admin)
router.get('/bags', isLogined, isAdmmin, bag_controller.bag_list);

//CASHSHOP ROUTES --------------------------------------------------------------------
//GET - POST request để tạo vật phẩm trong cashshop mới.
router.post('/cashshop/create', isLogined, isAdmmin, cashshop_controller.cashshop_create_post);

//GET - POST request để xóa vật phẩm trong cashshop.
router.post('/cashshop/:id/delete', isLogined, isAdmmin, cashshop_controller.cashshop_delete_post);

//GET - POST request để cập nhật vật phẩm trong cashshop.
router.post('/cashshop/:id/update', isLogined, isAdmmin, cashshop_controller.cashshop_update_post);

// GET request để liệt kê danh sách vật phẩm trong cashshop.
router.get('/cashshops', isLogined, isAdmmin, cashshop_controller.cashshop_item_list);

//CHARACTER ROUTES --------------------------------------------------------------------
//GET - POST request để tạo nhân vật mới.
router.get('/character/create', isLogined, isAdmmin, character_controller.character_create_get);
router.post('/character/create', isLogined, isAdmmin, character_controller.character_create_post);

//GET - POST request để xóa nhân vật.
// router.get('/character/:id/delete', character_controller.character_delete_get);
// router.post('/character/:id/delete', character_controller.character_delete_post);

//GET - POST request để cập nhật nhân vật.
router.get('/character/:id/update', isLogined, isAdmmin, character_controller.character_update_get);
router.post('/character/:id/update', isLogined, isAdmmin, character_controller.character_update_post);

// GET request chi tiết nhân vật.
router.get('/character/:id', isLogined, isAdmmin, character_controller.character_detail);

// GET request để liệt kê danh sách nhân vật.
router.get('/characters', isLogined, isAdmmin, character_controller.character_list);

//CLAN ROUTES --------------------------------------------------------------------
//GET - POST request để tạo clan mới.
router.get('/clan/create', isLogined, isAdmmin, clan_controller.clan_create_get);
router.post('/clan/create', isLogined, isAdmmin, clan_controller.clan_create_post);

//GET - POST request để xóa clan.
router.get('/clan/:id/delete', isLogined, isAdmmin, clan_controller.clan_delete_get);
router.post('/clan/:id/delete', isLogined, isAdmmin, clan_controller.clan_delete_post);

//GET - POST request để cập nhật clan.
router.get('/clan/:id/update', isLogined, isAdmmin, clan_controller.clan_update_get);
router.post('/clan/:id/update', isLogined, isAdmmin, clan_controller.clan_update_post);

// GET request chi tiết clan.
router.get('/clan/:id', isLogined, isAdmmin, clan_controller.clan_detail);

// GET request để liệt kê danh sách clan.
router.get('/clans', isLogined, isAdmmin, clan_controller.clan_list);


//IMAGE ROUTES --------------------------------------------------------------------
//GET - POST request để tạo hình ảnh mới.
router.get('/image/create', isLogined, isAdmmin, image_controller.image_create_get);
router.post('/image/create', isLogined, isAdmmin, image_controller.image_create_post);

//GET - POST request để xóa hình ảnh.
router.get('/image/:id/delete', isLogined, isAdmmin, image_controller.image_delete_get);
router.post('/image/:id/delete', isLogined, isAdmmin, image_controller.image_delete_post);

//GET - POST request để cập nhật hình ảnh.
router.get('/image/:id/update', isLogined, isAdmmin, image_controller.image_update_get);
router.post('/image/:id/update', isLogined, isAdmmin, image_controller.image_update_post);

// GET request chi tiết image.
router.get('/image/:id', isLogined, isAdmmin, image_controller.image_detail);

// GET request để liệt kê danh sách hình ảnh.
router.get('/images', isLogined, isAdmmin, image_controller.image_list);

//ITEM ROUTES --------------------------------------------------------------------
//GET - POST request để tạo vật phẩm mới.
router.post('/item/create', isLogined, isAdmmin, item_controller.item_create_post);

//GET - POST request để xóa vật phẩm.
router.post('/item/:id/delete', isLogined, isAdmmin, item_controller.item_delete_post);

//GET - POST request để cập nhật vật phẩm.
router.post('/item/:id/update', isLogined, isAdmmin, item_controller.item_update_post);


//LEVEL ROUTES --------------------------------------------------------------------
//GET - POST request để tạo cấp độ mới.
router.get('/level/create', isLogined, isAdmmin, level_controller.level_create_get);
router.post('/level/create', isLogined, isAdmmin, level_controller.level_create_post);

//GET - POST request để xóa cấp độ.
router.get('/level/:id/delete', isLogined, isAdmmin, level_controller.level_delete_get);
router.post('/level/:id/delete', isLogined, isAdmmin, level_controller.level_delete_post);

//GET - POST request để cập nhật cấp độ.
router.get('/level/:id/update', isLogined, isAdmmin, level_controller.level_update_get);
router.post('/level/:id:/update', isLogined, isAdmmin, level_controller.level_update_post);

//GET request chi tiết cấp độ.
router.get('/level/:id', isLogined, isAdmmin, level_controller.level_detail);

//GET request để liệt kê danh sách cấp độ.
router.get('/levels', isLogined, isAdmmin, level_controller.level_list);

//NEWS ROUTES --------------------------------------------------------------------
//GET - POST request để tạo tin tức mới.
router.get('/news/create', isLogined, isAdmmin, news_controller.news_create_get);
router.post('/news/create', isLogined, isAdmmin, news_controller.news_create_post);

//GET - POST request để xóa tin tức.
router.get('/news/:id/delete', isLogined, isAdmmin, news_controller.news_delete_get);
router.post('/news/:id/delete', isLogined, isAdmmin, news_controller.news_delete_post);

//GET - POST request để cập nhật tin tức.
router.get('/news/:id/update', isLogined, isAdmmin, news_controller.news_update_get);
router.post('/news/:id:/update', isLogined, isAdmmin, news_controller.news_update_post);

//GET request chi tiết tin tức.
router.get('/news/:id', isLogined, isAdmmin, news_controller.news_detail);

//GET request để liệt kê danh sách tin tức.
router.get('/news', isLogined, isAdmmin, news_controller.news_list);

//POKEMON ROUTES --------------------------------------------------------------------
//GET - POST request để tạo Pokémon mới.
router.post('/pokemon/create', isLogined, isAdmmin, pokemon_controller.pokemon_create_post);
//router.post('/item/create', isLogined, isAdmmin, item_controller.item_create_post);
//GET - POST request để xóa Pokémon.
// router.post('/pokemon/:id/delete', isLogined, isAdmmin, pokemon_controller.pokemon_delete_post);

//GET - POST request để cập nhật Pokémon.
router.post('/pokemon/:id/update', isLogined, isAdmmin, pokemon_controller.pokemon_update_post);

//GET request để liệt kê danh sách Pokémon.
router.get('/pokemons', isLogined, isAdmmin, pokemon_controller.pokemon_list);

//áichoasihoxzihcoixzh
router.get('/cashshops', isLogined, isAdmmin, cashshop_controller.cashshop_item_list);

//POKESTOP POSITION ROUTES --------------------------------------------------------------------
//GET - POST request để tạo Pokéstop position mới.
router.post('/pokestop/create', isLogined, isAdmmin, pokestopposition_controller.pokestopposition_create_post);

//GET - POST request để xóa Pokéstop position.
router.post('/pokestop/:id/lock', isLogined, isAdmmin, pokestopposition_controller.pokestopposition_lock_post);
router.post('/pokestop/:id/unlock', isLogined, isAdmmin, pokestopposition_controller.pokestopposition_unlock_post);

//GET - POST request để cập nhật Pokéstop position.
router.post('/pokestop/:id/update', isLogined, isAdmmin, pokestopposition_controller.pokestopposition_update_post);

//GET request để liệt kê danh sách Pokéstop position.
router.get('/pokestops', isLogined, isAdmmin, pokestopposition_controller.pokestopposition_list);

//POKEMON POSITION ROUTES --------------------------------------------------------------------
//GET - POST request để tạo Pokémon position mới.
router.post('/pokemonposition/create', isLogined, isAdmmin, pokemonposition_controller.pokemonposition_create_post);

//GET - POST request để xóa Pokémon position.
router.post('/pokemonposition/:id/delete', isLogined, isAdmmin, pokemonposition_controller.pokemonposition_delete_post);

//GET - POST request để cập nhật Pokémon position.
router.post('/pokemonposition/:id/update', isLogined, isAdmmin, pokemonposition_controller.pokemonposition_update_post);

//POKETRADE LOG ROUTES --------------------------------------------------------------------
//GET - POST request để tạo giao dịch Pokémon mới.
router.get('/poketradelog/create', isLogined, isAdmmin, poketradelog_controller.poketradelog_create_get);
router.post('/poketradelog/create', isLogined, isAdmmin, poketradelog_controller.poketradelog_create_post);

//GET - POST request để xóa giao dịch Pokémon.
router.get('/poketradelog/:id/delete', isLogined, isAdmmin, poketradelog_controller.poketradelog_delete_get);
router.post('/poketradelog/:id/delete', isLogined, isAdmmin, poketradelog_controller.poketradelog_delete_post);

//GET - POST request để cập nhật giao dịch Pokémon.
router.get('/poketradelog/:id/update', isLogined, isAdmmin, poketradelog_controller.poketradelog_update_get);
router.post('/poketradelog/:id:/update', isLogined, isAdmmin, poketradelog_controller.poketradelog_update_post);

//GET request chi tiết giao dịch Pokémon.
router.get('/poketradelog/:id', isLogined, isAdmmin, poketradelog_controller.poketradelog_detail);

//GET request để liệt kê danh sách giao dịch Pokémon.
router.get('/poketradelogs', isLogined, isAdmmin, poketradelog_controller.poketradelog_list);

//POKETYPE LOG ROUTES --------------------------------------------------------------------
//GET - POST request để tạo loại Pokémon mới.
router.get('/poketype/create', isLogined, isAdmmin, poketype_controller.poketype_create_get);
router.post('/poketype/create', isLogined, isAdmmin, poketype_controller.poketype_create_post);

//GET - POST request để xóa loại Pokémon.
router.get('/poketype/:id/delete', isLogined, isAdmmin, poketype_controller.poketype_delete_get);
router.post('/poketype/:id/delete', isLogined, isAdmmin, poketype_controller.poketype_delete_post);

//GET - POST request để cập nhật loại Pokémon.
router.get('/poketype/:id/update', isLogined, isAdmmin, poketype_controller.poketype_update_get);
router.post('/poketype/:id:/update', isLogined, isAdmmin, poketype_controller.poketype_update_post);

//GET request chi tiết loại Pokémon.
router.get('/poketype/:id', isLogined, isAdmmin, poketype_controller.poketype_detail);

//GET request để liệt kê danh sách loại Pokémon.
router.get('/poketypes', isLogined, isAdmmin, poketype_controller.poketype_list);

//RECHARGE LOG ROUTES --------------------------------------------------------------------
//GET - POST request để tạo lịch sử nạp tiền mới.
router.get('/rechargelog/create', isLogined, isAdmmin, rechargelog_controller.rechargelog_create_get);
router.post('/rechargelog/create', isLogined, isAdmmin, rechargelog_controller.rechargelog_create_post);

//GET - POST request để xóa lịch sử nạp tiền.
router.get('/rechargelog/:id/delete', isLogined, isAdmmin, rechargelog_controller.rechargelog_delete_get);
router.post('/rechargelog/:id/delete', isLogined, isAdmmin, rechargelog_controller.rechargelog_delete_post);

//GET - POST request để cập nhật lịch sử nạp tiền.
router.get('/rechargelog/:id/update', isLogined, isAdmmin, rechargelog_controller.rechargelog_update_get);
router.post('/rechargelog/:id:/update', isLogined, isAdmmin, rechargelog_controller.rechargelog_update_post);

//GET request chi tiết lịch sử nạp tiền.
router.get('/rechargelog/:id', isLogined, isAdmmin, rechargelog_controller.rechargelog_detail);

//GET request để liệt kê danh sách lịch sử nạp tiền.
router.get('/rechargelogs', isLogined, isAdmmin, rechargelog_controller.rechargelog_list);

//Xuất module
module.exports = router;