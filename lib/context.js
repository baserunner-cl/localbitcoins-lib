'use strict';

var Q = require('q'),
    Connection = require('./connection'),
    Myself = require('./myself'),
    Snapshot = require('./marketdata/snapshot'),
    Wallet = require('./wallet');

function LocalBitcoinsContext(options) {
    var self = this;

    self.options = options || {};
    self.connection = new Connection(self.options);
    self.myself = new Myself(self.connection);
    self.marketDataSnapshot = new Snapshot(self.connection);
    self.wallet = new Wallet(self.connection);

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

LocalBitcoinsContext.prototype.getLatestMarketDataSnapshot = function() {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        if (typeof self.myself.profile == 'undefined') {
            reject(new Error('Connection not yet initiated'));
        }
        self.marketDataSnapshot.getLatest()
            .then(function(snapshot) {
                resolve(snapshot);
            })
            .fail(function(error) {
                reject(error);
            });
    });
};

LocalBitcoinsContext.prototype.subscribeMarketDataSnapshot = function(intervalInMs) {
    var self = this;

    if (typeof intervalInMs == 'undefined') {
        intervalInMs = 5000;
    } else if (!Number.isInteger(intervalInMs) || intervalInMs < 5000) {
        throw new Error('Invalid interval parameter, it must be integer and greater than 5000ms (5s)');
    }

    if (typeof self.myself.profile == 'undefined') {
        throw new Error('Connection not yet initiated');
    }
    return self.marketDataSnapshot.subscribe(5000);
};

LocalBitcoinsContext.prototype.unsubscribeMarketDataSnapshot = function() {
    var self = this;

    if (typeof self.myself.profile == 'undefined') {
        throw new Error('Connection not yet initiated');
    }

    self.marketDataSnapshot.unsubscribe();
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
