'use strict';

var Q = require('q');

function Wallet(connection) {
    var self = this;

    self.URI = '/api/wallet/';
    self.URI_BALANCE = '/api/wallet-balance';
    self.connection = connection;

    self.latest = undefined;

    return self;
}

Wallet.prototype.loadLatest = function () {
    var self = this;

    return Q.Promise(function (resolve, reject, notify) {
        self.connection.makeRequest({uri: self.URI, uriParam: '', method: 'GET'})
            .then(function (data) {
                self.latest = JSON.parse(data);
                resolve(self.latest)
            })
            .fail(function (error) {
                reject(error);
            });
    });
};

Wallet.prototype.refreshBalance = function () {
    // intended to ignore receiving_address_list and receiving_address_count
    // todo: update the logic here to cater the receiving addresses parameters as only the first one returned in this call
    var self = this;

    if (typeof self.latest == 'undefined') {
        return self.loadLatest();
    } else {
        return Q.Promise(function (resolve, reject, notify) {
            self.connection.makeRequest({uri: self.URI_BALANCE, uriParam: '', method: 'GET'})
                .then(function (data) {
                    var tmpData = JSON.parse(data);
                    if (tmpData.hasOwnProperty('total')) {
                        self.latest.total = tmpData.total;
                        resolve(self.latest);
                    } else {
                        reject(new Error('Invalid Message Content - could not find expected field "total"'));
                    }
                })
                .fail(function (error) {
                    reject(error);
                });
        });
    }
};

module.exports = Wallet;
