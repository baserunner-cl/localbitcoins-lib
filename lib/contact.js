'use strict';

const Q = require('q');
const util = require('util');

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

}

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
 * Request info from an appropriate Contact API
 *
 * @param options - { currency: 'USD' }
 * @returns {boolean}
 */
Contact.prototype.getInfo = function(options) {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        if (!util.isFunction(self.getUri)) {
            reject(new Error('Function getUri is not defined!'));
        }
        if (self.getUri(options)) {
            if(options.type === 'info' || options.type === 'messages' ) {
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
                reject(new Error('Please use the submit method to POST to a contact API'));
            }
        } else {
            reject(new Error('Invalid options'));
        }
    });
};

/**
 * submit a POST to an appropriate Contact API
 *
 * @param options - { currency: 'USD' }
 * @param data - the appropriate payload for this POST
 * @returns {boolean}
 */
Contact.prototype.submit = function(options, data) {
    var self = this;

    return Q.Promise(function(resolve, reject, notify) {
        if (!util.isFunction(self.getUri)) {
            reject(new Error('Function getUri is not defined!'));
        }
        if (self.getUri(options)) {
            if(options.type !== 'info' || options.type !== 'messages' ) {
                self.connection.makeRequest({uri: self.getUri(options), uriParam: '', method: 'POST'}, data)
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
                reject(new Error('Please use the getInfo method to GET a contact API'));
            }
        } else {
            reject(new Error('Invalid options'));
        }
    });
};

module.exports = Contact;
