'use strict';

const util = require('util');
const Subscription = require('./subscription');

//TODO: Further normalise these classes. Trades and OrderBook could be merged
function Trades(connection) {
    var self = this;

    self.connection = connection;

    self.URI_PREFIX = '/bitcoincharts/';
    self.URI_API = '/trades.json';

    Subscription.call(self);
}

util.inherits(Trades, Subscription);

/**
 * Return the URI for this API call
 *
 * @param options - { currency: 'USD' }
 * @returns {string}
 */
Trades.prototype.getUri = function(options) {
    var self = this;

    if (!options.hasOwnProperty('currency') || !options.currency) {
        throw new Error('Invalid options. Currency can not be found');
    }
    return self.URI_PREFIX + options.currency + self.URI_API;
};

/**
 * Validate the provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {boolean}
 */
Trades.prototype.validateGetLatestParam = function(options) {
    return options.hasOwnProperty('currency') && options.currency;
};

/**
 * Return the subscription handler key from provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {*}
 */
Trades.prototype.getSubscriptionHandlerKey = function(options) {
    var self = this;

    if (self.validateGetLatestParam(options)) {
        return options.currency;
    }

    throw new Error('Invalid options. Currency can not be found');
};

module.exports = Trades;
