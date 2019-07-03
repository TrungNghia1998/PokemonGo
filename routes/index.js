var express = require('express');
var router = express.Router();

//Require controller modules.
var news_controller = require('../controllers/newsController');
// var cashshop_controller=require('../controllers/cashshopController');
// var character_controller=require('../controllers/characterController');

/* GET home page. */
// router.get('/', function (req, res) {
//     res.sendFile('baokim_448fc52fa67dbc33.html', { root: './views/' })
// });

//TEST CASHSHOP
// router.get('/cashshop',cashshop_controller.cashshop_list_user);
// router.get('/cashshop/:id/buy', cashshop_controller.cashshop_buy_get);
// router.post('/cashshop/:id/buy', cashshop_controller.cashshop_buy_post);

// GET request cho mỗi loại news.
router.get('/sukien/:id', news_controller.news_detail); //sự kiện
router.get('/tintuc/:id', news_controller.news_detail); //tin tức
router.get('/huongdan/:id', news_controller.news_detail); //hướng dẫn
router.get('/khuyenmai/:id', news_controller.news_detail); //khuyến mãi

//TEST CHARACTER
// router.get('/character/create',character_controller.character_create_get_user);

// GET request danh sách
router.get('/', news_controller.index);

//GET quảngcao1
router.get('/lienhequangcao',(req,res,next)=>{
    res.render('catalogAds');
});

//GET request để liệt kê danh sách tin tức.
// GET request để lấy chi tiết tin tức
router.get('/news/:id', news_controller.news_detail_for_user);
module.exports = router;
