'use strict';

const Q = require('q');
const util = require('util');

/**
 * Constructor
 *
 * @constructor
 */
function Subscription() {
    var self = this;

    self.subscriptions = [];
}

/**
 * Get latest snapshot
 *
 * @param options - { currency: 'USD' }
 * @returns {*}
 */
Subscription.prototype.getLatest = function(options) {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        if (!util.isFunction(self.getUri)) {
            reject(new Error('Function getUri is not defined!'));
        }
        if (self.validateGetLatestParam(options)) {
            self.connection.makeRequest({uri: self.getUri(options), uriParam: '', method: 'GET'})
                .then(function (data) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (exp) {
                        reject(exp);
                    }
                })
                .fail(function (error) {
                    reject(error);
                });
        } else {
            reject(new Error('Invalid options'));
        }
    });
};

/**
 * Subscribe
 *
 * @param options - { intervalInMs: 5000, currency: 'USD' }
 * @returns {*}
 */
Subscription.prototype.subscribe = function(options) {
    var self = this;

    return Q.promise(function(resolve, reject, notify) {
        if (!util.isFunction(self.validateGetLatestParam)) {
            reject(new Error('No proper validateGetLatestParam defined'));
        }
        if (!util.isFunction(self.getSubscriptionHandlerKey)) {
            reject(new Error('No proper getHandlerKey'));
        }

        if (!options.hasOwnProperty('intervalInMs') || options.intervalInMs < 5000) {
            reject(new Error('Interval must be greater than 5s (5000ms)'));
        } else if (!self.validateGetLatestParam(options)) {
            reject(new Error('Parameter validation failed'));
        } else {

            var handlerKey = self.getSubscriptionHandlerKey(options);

            self.subscriptions[handlerKey] = {
                handler: undefined,
                previousSnapshot: undefined,
                latestSnapshot: undefined,
                resolveCallback: resolve
            };

            self.subscriptions[handlerKey].handler = setInterval(function() {
                var subscription = self.subscriptions[handlerKey];
                subscription.previousSnapshot = subscription.latestSnapshot;
                self.getLatest(options)
                    .then(function(snapshot) {
                        subscription.previousSnapshot = subscription.latestSnapshot;
                        subscription.latestSnapshot = snapshot;

                        if (util.isFunction(self.enrichSnapshot)) {
                            subscription.previousSnapshot = self.enrichSnapshot(snapshot, subscription.previousSnapshot);
                        }

                        notify(snapshot);
                    })
                    .fail(function(error) {
                        reject(error);
                    });
            }, options.intervalInMs);
        }
    });
};

/**
 * Unsubscribe
 *
 * @param options - { currency: 'USD' }
 */
Subscription.prototype.unsubscribe = function(options) {
    var self = this;

    self.previousSnapshot = undefined;

    if (!util.isFunction(self.validateGetLatestParam)) {
        throw new Error('No proper validateGetLatestParam defined');
    }
    if (!util.isFunction(self.getSubscriptionHandlerKey)) {
        throw new Error('No proper getHandlerKey');
    }

    var handlerKey = self.getSubscriptionHandlerKey(options);

    if (typeof self.subscriptions[handlerKey] !== 'undefined') {
        clearInterval(self.subscriptions[handlerKey].handler);
        self.subscriptions[handlerKey].resolveCallback();

        delete self.subscriptions[handlerKey];
    }
};

module.exports = Subscription;
