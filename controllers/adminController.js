var Account = require('../models/account');
var Bag = require('../models/bag');
var Cashshop = require('../models/cashshop');
var Character = require('../models/character');
var Clan = require('../models/clan');
var Image = require('../models/image');
var Item = require('../models/item');
var Level = require('../models/level');
var News = require('../models/news');
var Pokemon = require('../models/pokemon');
var PokemonPosition = require('../models/pokemonposition');
var PokestopPosition = require('../models/pokestopposition');
var PokeTradeLog = require('../models/poketradelog');
var Poketype = require('../models/poketype');
var RechargeLog = require('../models/rechargelog');
var moment = require('moment')
var momentTZ = require('moment-timezone')

var async = require('async');   //module async (liên quan tới đồng bộ hoặc bất đồng bộ)

//Index
exports.index = function (req, res) {
    //parallel: to execute any operations that must be performed in parallel.
    async.parallel({
        rechargeLog: function (callback) {
            RechargeLog.find()
                .populate('accountid')
                .exec(callback);
        }
    }, function (err, results) {
        var revenueToday = { mcard: 0, paypal: 0, braintree: 0 };
        var revenueYesterday = { mcard: 0, paypal: 0, braintree: 0 };
        var revenueLastWeek = { mcard: 0, paypal: 0, braintree: 0 };
        for (var i = 0; i < results.rechargeLog.length; i++) {
            if (results.rechargeLog[i].method == "MCARD") {
                if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 0)
                    revenueToday.mcard += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 1)
                    revenueYesterday.mcard += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') > 1 &&
                    moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') <= 7)
                    revenueLastWeek.mcard += parseFloat(results.rechargeLog[i].amount)
            }
            else if (results.rechargeLog[i].method == "PAYPAL") {
                if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 0)
                    revenueToday.paypal += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 1)
                    revenueYesterday.paypal += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') > 1 &&
                    moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') <= 7)
                    revenueLastWeek.paypal += parseFloat(results.rechargeLog[i].amount)
            } else {
                if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 0)
                    revenueToday.braintree += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') == 1)
                    revenueYesterday.braintree += parseFloat(results.rechargeLog[i].amount)
                else if (moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') > 1 &&
                    moment(new Date()).diff(moment(results.rechargeLog[i].date), 'day') <= 7)
                    revenueLastWeek.braintree += parseFloat(results.rechargeLog[i].amount)
            }
        }
        res.render('admin/index', {
            title: 'Trang chủ | Admin - MiddleField', error: err, name: req.user.username,
            revenueToday: revenueToday, revenueYesterday: revenueYesterday, revenueLastweek: revenueLastWeek, data: results.rechargeLog
        });
    });
};

//recharge log api
exports.rechargelogAPI = function (req, res, next) {
    RechargeLog.find(function (err, data) {
        if (err) next(err)
        res.json(data)
    }).populate('accountid')
}