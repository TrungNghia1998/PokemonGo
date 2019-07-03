var Cashshop = require("../models/cashshop");
var Item = require("../models/item");
var Character = require("../models/character");
var Bag = require("../models/bag");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
var async = require("async");
const Transaction = require("mongoose-transactions");
const transaction = new Transaction();

exports.cashshop_item_list = function (req, res, next) {
  let msg = req.query.msg == undefined ? ' Danh sách vật phẩm và lịch sử giao dịch' : req.query.msg;
  async.parallel({
    list_cashshop: function (callback) {
      Cashshop.find()
        .populate({ path: 'itemid', populate: { path: 'image' } })
        .populate({ path: 'translog.characterid', model: 'Character' })
        .exec(callback)
    },
    list_item: function (callback) {
      Item.find()
        .populate('image')
        .exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    results.list_item.sort(function (a, b) {
      var nameA = a.name.toUpperCase(); // bỏ qua hoa thường
      var nameB = b.name.toUpperCase(); // bỏ qua hoa thường
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // name trùng nhau
      return 0;
    });

    results.list_cashshop.sort(function (a, b) {
      var nameA = a.itemid.name.toUpperCase(); // bỏ qua hoa thường
      var nameB = b.itemid.name.toUpperCase(); // bỏ qua hoa thường
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // name trùng nhau
      return 0;
    });

    res.render('admin/cashshop_list', {
      title: 'Quản lý Cashshop | Admin - MiddleField',
      name: req.user.username,
      cashshop_list: results.list_cashshop,
      item_list: results.list_item,
      msg: msg
    });
  });
};

// Xử lý tạo cash shop bằng POST.
exports.cashshop_create_post = [
  body('price').isNumeric().withMessage("Giá vật phẩm phải là số!"),
  sanitizeBody("*").escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var msg = '';
      errors.array().forEach(element => {
        msg += element.msg + ". "
      });
      //Có lỗi. Trả về là có lỗi với thông báo ở trên.
      res.redirect(`/admin/cashshops?msg=` + encodeURI(msg));
    } else {
      Cashshop.find({ itemid: req.body.itemid })
        .exec((err, found) => {
          if (err) return next(err);
          if (found.length != 0) {
            res.redirect(`/admin/cashshops?msg=` + encodeURI(`Vật phẩm ${req.body.name} đã tồn tại trong cashshop`));
            return;
          }
        });
      //Thêm vật phẩm với dữ liệu đã được "sạch".
      var item = new Cashshop({
        itemid: req.body.itemid,
        price: req.body.price,
        startdate: new Date(new Date() + "GMT+7:00"),
        translog: new Array()
      });

      try {
        transaction.insert("Cashshop", item);
        await transaction.run().then(() => {
          transaction.clean();
          res.redirect(`/admin/cashshops?msg=` + encodeURI(`Thêm vật phẩm ${req.body.name} vào cashshop thành công`));
        });
      } catch (err) {
        console.log(err)
        transaction.rollback();
        transaction.clean();
        res.redirect(`/admin/cashshops?msg=` + encodeURI(`Thêm vật phẩm ${req.body.name} vào cashshop thất bại (DB)`));
      }
    }
  }
];

// Xử lý xóa cash shop bằng POST.
exports.cashshop_delete_post = function (req, res, next) {
  async.parallel({
    item_found: function (callback) {
      Cashshop.findById(req.params.id).exec(callback)
    }
  }, async function (err, results) {
    if (err) next(err);
    //Thành công
    try {
      transaction.remove("Cashshop", results.item_found._id);
      await transaction.run().then(() => {
        transaction.clean();
        res.redirect(`/admin/cashshops?msg=` + encodeURI(`Xóa vật phẩm khỏi cashshop thành công`));
      });

    } catch (err) {
      transaction.rollback();
      transaction.clean();
      res.redirect(`/admin/cashshops?msg=` + encodeURI(`Xóa vật phẩm khỏi cashshop thất bại (DB)`));
    }
  });
};

// Xử lý cập nhật cash shop bằng POST.
exports.cashshop_update_post = [
  body("price").custom(value => {
    if (value < 0) {
      throw new Error("Giá phải là số dương");
    } else {
      return true;
    }
  }),
  sanitizeBody("*").escape(),

  //Hợp lệ và sạch rồi thì triển thôi
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      var msg = '';
      errors.array().forEach(element => {
        msg += element.msg + ". "
      });
      //Có lỗi. Trả về là có lỗi với thông báo ở trên.
      res.redirect(`/admin/cashshops?msg=` + encodeURI(msg));

    } else {
      //Thêm vật phẩm với dữ liệu đã được "sạch".
      var item = new Cashshop({
        itemid: req.body.itemid,
        price: req.body.price,
        startdate: new Date(new Date() + "GMT+7:00"),
        translog: new Array(),
        _id: req.params.id
      });
      //Dữ liệu trong form hợp lệ. Cập nhật ngay và luôn
      try {
        transaction.update("Cashshop", req.params.id, item);
        await transaction.run().then(() => {
          transaction.clean();
          res.redirect(`/admin/cashshops?msg=` + encodeURI(`Cập nhật vật phẩm ${req.params.name} trong cashshop thành công`));
        });

      } catch (err) {
        transaction.rollback();
        transaction.clean();
        res.redirect(`/admin/cashshops?msg=` + encodeURI(`Cập nhật vật phẩm ${req.params.name} trong cashshop thất bại (DB)`));
      }
    }
  }
];

//==================USER===================================




//xử lý yêu cầu POST mua của user
exports.cashshop_buy_post = [
  body("amount").custom(value => {
    if (value < 0) {
      throw new Error("Số lượng phải là số dương");
    } else {
      return true;
    }
  }),
  sanitizeBody("*").escape(),
  (req, res, next) => {
    Character.findOne({ accountid: req.user._id }, function (err, character) {
      if (err) {
        return next(err);
      }
      if (req.body.type == 1) {
        Cashshop.findOne({ _id: req.body.iditem }).populate('itemid').exec(async (err, itemVIP) => {
          if (err) return next(err);
          var moment = require('moment')
          var months = parseInt(itemVIP.itemid.detail.replace('VIP', ""))
          if (character.gem < itemVIP.price) {
            res.status(200).send({ status: '900' });
            return
          }
          else {
            itemVIP.translog.push({ characterid: character._id, amount: 1, date: moment(new Date()) });
            character.gem = character.gem - itemVIP.price;
            if (character.isVIP == undefined || character.isVIP == null || moment(new Date()).diff(character.isVIP, "months") > 0)
              character.isVIP = moment(new Date()).add(months, 'M')
            else
              character.isVIP = moment(character.isVIP).add(months, 'M')
            try {
              transaction.update("Character", character._id, character);
              transaction.update("Cashshop", itemVIP._id, itemVIP);
              await transaction.run();
              transaction.clean();
              res.status(200).json({ status: '200' });
            } catch (err) {
              res.status(899).send({ status: '899' });
              transaction.rollback();
              transaction.clean();
            }
          }
        });
      }
      else {
        async.parallel(
          {
            bag: function (callback) {
              Bag.findOne({ characterid: character._id }).exec(callback);
            },
            cashshop: function (callback) {
              Cashshop.findOne({ _id: req.body.iditem }).exec(callback);
            }
          },
          async function (err, results) {
            if (err) {
              return next(err);
            }
            //Extract the validation errors from a request.
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              res.status(200).send({ status: '404' });
              return
            }
            if (character.gem < (results.cashshop.price * req.body.amount)) {
              res.status(200).send({ status: '900' });
              return;
            }
            if (
              results.bag.itemcur + parseInt(req.body.amount) > results.bag.limit ||
              results.bag.pokecur + 1 > results.limit
            ) {
              //Kiểm tra xem túi đầy chưa
              res.status(200).send({ status: '901' });
              return
            } else {
              //console.log(results.item.price);
              results.cashshop.translog.push({ characterid: character._id, amount: req.body.amount, date: new Date(new Date() + 'GMT+7:00') });
              character.gem = character.gem - (results.cashshop.price * req.body.amount);

              //Bỏ đồ mua được vô túi
              var flag = false;
              var n = results.bag.items.length;
              //kiểm tra xem vật phẩm tồn tại chưa
              for (var i = 0; i < n; i++) {
                if (results.bag.items[i].itemid.toString() == results.cashshop.itemid) {
                  flag = true;
                  results.bag.items[i].amount = results.bag.items[i].amount + parseInt(req.body.amount);
                  try {
                    transaction.update("Bag", results.bag._id, results.bag);
                    transaction.update("Character", character._id, character);
                    transaction.update("Cashshop", results.cashshop._id, results.cashshop);
                    await transaction.run().then(() => {
                      transaction.clean();
                      res.status(200).json({ status: '200' });
                    });
                  } catch (err) {
                    res.status(899).send({ status: '899' });
                    transaction.rollback();
                    transaction.clean();
                  }
                  break;
                }
              }
              if (flag == false) {
                results.bag.items.push({ itemid: results.cashshop.itemid, amount: req.body.amount });
                try {
                  transaction.update("Bag", results.bag._id, results.bag);
                  transaction.update("Character", character._id, character);
                  transaction.update("Cashshop", results.cashshop._id, results.cashshop);
                  await transaction.run().then(() => {
                    transaction.clean();
                    res.status(200).json({ status: '200' });
                  });
                } catch (err) {
                  res.status(899).send({ status: '899' });
                  transaction.rollback();
                  transaction.clean();
                }
              }
            }
          }
        )
      }
    })
  }
];
