'use strict';

var Q = require('q');

var enrichSnapshot = function(snapshot, previousSnapshot) {

    snapshot.timestamp = Date.now();

    if (typeof previousSnapshot == 'undefined') {
        return snapshot;
    }

    Object.keys(snapshot).forEach(function(currency) {
        console.log('process ' + currency);
        if (snapshot[currency].hasOwnProperty('rates') &&
            snapshot[currency]['rates'].hasOwnProperty('last') &&
            previousSnapshot[currency].hasOwnProperty('rates') &&
            previousSnapshot[currency]['rates'].hasOwnProperty('last')) {

            console.log('update ' + currency);
            var currentLast = snapshot[currency].rates.last;
            var previousLast = previousSnapshot[currency].rates.last;
            var change = currentLast - previousLast;

            snapshot[currency].rates.change = currentLast - previousLast;
            snapshot[currency].rates.changePercent = previousLast > 0 ? change / previousLast : undefined;
            snapshot[currency].rates.previous = previousLast;
        }
    });

    return snapshot;
};


function Snapshot(connection) {
    var self = this;

    self.subscribing = false;
    self.URI = '/bitcoinaverage/ticker-all-currencies/';
    self.connection = connection;

    self.previousSnapshot = undefined;
    self.latestSnapshot = undefined;
    self.subscribeHandler = undefined;
}

Snapshot.prototype.getLatest = function() {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        self.connection.makeRequest({uri: self.URI, uriParam: '', method: 'GET'})
            .then(function(data) {
                try {
                    self.latestSnapshot = enrichSnapshot(JSON.parse(data), self.previousSnapshot);
                    resolve(self.latestSnapshot);
                } catch (exp) {
                    reject(exp);
                }
            })
            .fail(function(error) {
                reject(error);
            });
    });
};

Snapshot.prototype.subscribe = function(intervalInMs) {
    var self = this;

    self.subscribing = true;

    return Q.promise(function(resolve, reject, notify) {
        if (intervalInMs < 5000) {
            reject(new Error('Interval must be greater than 5s (5000ms)'));
        } else {
            self.subscribeHandler = setInterval(function() {
                if (self.subscribing === true) {
                    self.getLatest()
                        .then(function (snapshot) {
                            self.previousSnapshot = snapshot;
                            notify(snapshot);
                        })
                        .fail(function (error) {
                            reject(error);
                        });
                } else {
                    resolve();
                }
            }, intervalInMs);
        }
    });
};

Snapshot.prototype.unsubscribe = function() {
    var self = this;

    self.previousSnapshot = undefined;

    if (self.subscribing === true) {
        self.subscribing = false;
    }
    if (self.subscribeHandler) {
        clearInterval(self.subscribeHandler);
        self.subscribeHandler = undefined;
    }
};

module.exports = Snapshot;
