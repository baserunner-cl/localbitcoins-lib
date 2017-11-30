'use strict';

const util = require('util');
const Subscription = require('./subscription');

/**
 * Constructor
 *
 * TODO: Further normalise these classes.
 *
 * @param connection
 * @constructor
 */
 function Contact(connection) {
    var self = this;

    self.connection = connection;

    self.URI_PREFIX = '/api/';
    self.URI_API = {
        cancel: 'contact_cancel/',
        create: 'contact_create/',
        dispute: 'contact_dispute/',
        feedback: 'feedback/',
        fund: 'contact_fund/',
        info: 'contact_info/',
        mark_as_paid: 'contact_mark_as_paid/',
        mark_identified: 'contact_mark_identified/',
        mark_realname: 'contact_mark_realname/',
        messages: 'contact_messages/',
        message_post: 'contact_message_post/',
        release: 'contact_release/',
        release_pin: 'contact_release_pin/'
    };

    Subscription.call(self);
}

util.inherits(Contact, Subscription);

/**
 * Return the URI for this API call
 *
 * @param options - { currency: 'USD' }
 * @returns {string}
 */
Contact.prototype.getUri = function(options) {
    var self = this;

    if (!options.hasOwnProperty('type') || !options.type) {
        throw new Error('Invalid options. Type can not be found');
    }

    let returnStr = self.URI_PREFIX + self.URI_API[options.type];

    if((!options.hasOwnProperty('id') || !options.id) && options.type !== 'info') {
        throw new Error('Invalid options. ID can not be found');
    } else if(options.type === 'info' && (!options.hasOwnProperty('id') || !options.id) ){
        return returnStr;
    }

    return returnStr + options.id + '/';
};

/**
 * Validate the provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {boolean}
 */
Contact.prototype.validateGetLatestParam = function(options) {
    return options.hasOwnProperty('type') && options.type;
};

/**
 * Return the subscription handler key from provided options
 *
 * @param options - { currency: 'USD' }
 * @returns {*}
 */
Contact.prototype.getSubscriptionHandlerKey = function(options) {
    var self = this;

    if (self.validateGetLatestParam(options)) {
        return options.type;
    }

    throw new Error('Invalid options. Type can not be found');
};

module.exports = Contact;
