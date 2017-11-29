'use strict';

const util = require('util');
const Subscription = require('./subscription');
const countries = require('../../countries');

/**
 * Constructor
 *
 * TODO: Further normalise these classes.
 *
 * @param connection
 * @constructor
 */
function OnlineAdvertisements(connection) {
    var self = this;

    self.connection = connection;

    self.URI_PREFIX = {
        buy: '/buy-bitcoins-online/'
        sell: '/sell-bitcoins-online/'
    };
    self.URI_API = '/.json';

    Subscription.call(self);
}

util.inherits(OnlineAdvertisements, Subscription);

/**
 * Return the URI for this API call
 *
 * @param options - { currency: 'USD' }
 * @returns {string}
 */
OnlineAdvertisements.prototype.getUri = function(options) {
    var self = this;

    if (!options.hasOwnProperty('type') || !options.type) {
        throw new Error('Invalid options. Type can not be found');
    }

    let returnStr = self.URI_PREFIX[options.type];

    if (options.hasOwnProperty('currency') && options.currency) {
        returnStr += options.currency;

        if (options.hasOwnProperty('payment_method') && options.payment_method) {
            returnStr += options.payment_method;
        }

        returnStr += self.URI_API;
    }

    if (options.hasOwnProperty('countrycode') && options.countrycode) {
        const country = countries[options.countrycode].map(l => { if(l === ' ') { return '_'; } else { return l.toLowerCase(); } });
        returnStr += options.countrycode + '/' + country;

        if (options.hasOwnProperty('payment_method') && options.payment_method) {
            returnStr += '/' + options.payment_method;
        }

        returnStr += self.URI_API;
    }

    if ((!options.hasOwnProperty('countrycode') || !options.countrycode)
        && (!options.hasOwnProperty('currency') || !options.currency)
        && options.hasOwnProperty('payment_method') && options.payment_method) {

        returnStr += options.payment_method + self.URI_API;
    }

    return returnStr;
};

/**
 * Validate the provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {boolean}
 */
OnlineAdvertisements.prototype.validateGetLatestParam = function(options) {
    return (options.hasOwnProperty('currency') && options.currency) ||
           (options.hasOwnProperty('countrycode') && options.countrycode) ||
           (options.hasOwnProperty('payment_method') && options.payment_method);
};

/**
 * Return the subscription handler key from provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {*}
 */
OnlineAdvertisements.prototype.getSubscriptionHandlerKey = function(options) {
    var self = this;

    if (self.validateGetLatestParam(options)) {
        return options.currency || options.payment_method || options.countrycode;
    }

    throw new Error('Invalid options. Currency can not be found');
};

module.exports = OnlineAdvertisements;
