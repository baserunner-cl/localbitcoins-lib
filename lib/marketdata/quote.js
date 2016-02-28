'use strict';

const util = require('util');
const Subscription = require('./subscription');

/**
 * Constructor
 *
 * TODO: Further normalise these classes. Trades and OrderBook could be merged
 *
 * @param connection
 * @constructor
 */
function Quote(connection) {
    var self = this;

    self.URI = '/bitcoinaverage/ticker-all-currencies/';
    self.connection = connection;

    Subscription.call(self);
}

util.inherits(Quote, Subscription);

/**
 * Return the URI for this API call
 *
 * @returns {string}
 */
Quote.prototype.getUri = function() {
    var self = this;

    return self.URI;
};

/**
 * Validate the provided options
 *
 * @param options - not needed in this API call
 * @returns {boolean}
 */
Quote.prototype.validateGetLatestParam = function(options) {
    return true;
};

/**
 * Return the subscription handler key from provided options
 *
 * @param options - not needed in this API call
 * @returns {string}
 */
Quote.prototype.getSubscriptionHandlerKey = function(options) {
    return 'Quote';
};

/**
 * Enrich the snapshot - adding delta between the previous snapshot and the current one
 *
 * @param snapshot
 * @param previousSnapshot
 * @returns {*}
 */
Quote.prototype.enrichSnapshot = function(snapshot, previousSnapshot) {

    snapshot.timestamp = Date.now();

    if (typeof previousSnapshot == 'undefined') {
        return snapshot;
    }

    Object.keys(snapshot).forEach(function(currency) {
        if (snapshot[currency].hasOwnProperty('rates') &&
            snapshot[currency]['rates'].hasOwnProperty('last') &&
            previousSnapshot[currency].hasOwnProperty('rates') &&
            previousSnapshot[currency]['rates'].hasOwnProperty('last')) {

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

module.exports = Quote;
