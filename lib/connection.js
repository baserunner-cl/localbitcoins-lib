'use strict';

var crypto = require("crypto"),
    https = require('https'),
    Q = require('q');

const CONNECTION_HOST = 'localbitcoins.com';
const METHOD_GET = 'GET';
const METHOD_POST = 'POST';

function urlencode(flat_object) {
    return Object.keys(flat_object).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(flat_object[key]);
    }).join('&');
}

var makeHmacRequest = function (hmacOption, requestOptions) {
    return Q.Promise(function (resolve, reject, notify) {
        if (!requestOptions.hasOwnProperty('method') || !requestOptions.hasOwnProperty('uri') ||
            (requestOptions.method !== METHOD_GET && requestOptions.method !== METHOD_POST)) {
            reject(new Error('Invalid request options. Method is missing or invalid.'));
        }

        var nonce = Date.now();
        var message = nonce + hmacOption.key + requestOptions.uri + urlencode(requestOptions.uriParam);
        var signature = crypto.createHmac('sha256', hmacOption.secret).update(message).digest('hex').toUpperCase();

        var apiOption = {
            host: CONNECTION_HOST,
            path: requestOptions.uri,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Apiauth-Key': hmacOption.key,
                'Apiauth-Nonce': nonce,
                'Apiauth-Signature': signature
            }
        };

        var content = '';
        var transmit = null;
        if (requestOptions.method == METHOD_GET) {
            transmit = https.get(apiOption, function (response) {
                response.on('data', function (data) {
                    content += data;
                });
                response.on('end', function () {
                    resolve(content);
                })
            }).on('error', function (e) {
                reject(new Error(e));
            });
        } else {
            apiOption.method = requestOptions.method;
            transmit = https.request(apiOption, function (response) {
                response.on('data', function (data) {
                    content += data;
                });
                response.on('end', function () {
                    resolve(content);
                })
            }).on('error', function (e) {
                reject(new Error(e));
            });

            if(requestOptions.uriParam) {
                transmit.write(urlencode(requestOptions.uriParam));
            }
        }
        transmit.end();
    });
};

function Connection(options) {
    var self = this;

    self.options = options || {};

    if (!self.options.hasOwnProperty('useHmac') && self.options.hasOwnProperty('useOAuth2')) {
        throw Error('Invalid options - please specific either HMAC or OAuth2')
    }

    if (self.options.useHmac === true && self.options.useOAuth2 === true) {
        throw Error('Invalid Options - please choose either HMAC or OAuth2')
    }

    if (self.options.useHmac === true) {
        if (!(self.options.hasOwnProperty('hmacKey') && self.options.hasOwnProperty('hmacSecret'))) {
            throw Error('Invalid Options - please check HMAC options')
        }
    } else if (self.options.useOAuth2 === true) {
        throw Error('Not supported at the moment.');
    } else {
        throw Error();
    }

    return self;
}

Connection.prototype.makeRequest = function (requestOptions) {
    var self = this;

    if (self.options.useHmac === true) {
        return makeHmacRequest({key: self.options.hmacKey, secret: self.options.hmacSecret}, requestOptions);
    }

    throw Error('Invalid Options');
};


module.exports = Connection;


