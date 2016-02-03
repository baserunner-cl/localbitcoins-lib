'use strict';

const Q = require('q');
const Connection = require('./connection');
const Myself = require('./myself');
const OrderBook = require('./marketdata/orderbook');
const Quote = require('./marketdata/quote');
const Trades = require('./marketdata/trades');
const Wallet = require('./wallet');

function LocalBitcoinsContext(options) {
    var self = this;

    self.options = options || {};
    self.connection = new Connection(self.options);
    self.myself = new Myself(self.connection);
    self.wallet = new Wallet(self.connection);
    self.Quote = new Quote(self.connection);
    self.OrderBook = new OrderBook(self.connection);
    self.Trades = new Trades(self.connection);

    return self;
}

LocalBitcoinsContext.prototype.connect = function() {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        self.myself.load()
            .then(function(data) {
                resolve(data);
            })
            .fail(function(error) {
                reject(error);
            });
    });
};

LocalBitcoinsContext.prototype.loadWallet = function() {
    var self = this;

    return self.wallet.loadLatest();
};

LocalBitcoinsContext.prototype.refreshWalletBalance = function() {
    var self = this;

    return self.wallet.refreshBalance();
};

module.exports = LocalBitcoinsContext;
