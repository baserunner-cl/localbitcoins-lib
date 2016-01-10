'use strict';

var Q = require('q');

function Myself(connection) {
    var self = this;

    self.URI = '/api/myself/';
    self.connection = connection;

    self.profile = undefined;
}

Myself.prototype.load = function() {
    var self = this;

    return Q.Promise(function (resolve, reject, notify) {
        self.connection.makeRequest({uri: self.URI, uriParam: '', method: 'GET'})
            .then(function(data) {
                var rawData = JSON.parse(data);
                self.profile = {
                    username: rawData.data.username,
                    url: rawData.data.url,
                    feedbackScore: rawData.feedback_score,
                    hasCommonTrades: rawData.has_common_trades,
                    hasFeedback: rawData.has_feedback,
                    feedbackCount: rawData.feedback_count,
                    feedbacksUnconfirmedCount: rawData.feedbacks_unconfirmed_count,
                    trustedCount: rawData.trusted_count
                };
                resolve(self.profile);
            })
            .fail(function(error) {
                reject(error);
            });
    });
};

module.exports = Myself;
