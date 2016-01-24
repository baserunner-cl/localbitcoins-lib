# localbitcoins-lib

This is a NodeJS client library for interfacing [localbitcoins](https://localbitcoins.com).

## Installation

`npm install localbitcoins-lib`

## Quick Start

## HMAC Key and Secret

In order to interface [localbitcoins](https://localbitcoins.com) with HMAC option, key and secret have to created beforehand. Please refer to [localbitcoins's API](https://localbitcoins.com/api-docs/#toc2) for more information

```javascript

'use strict';

var localbitcoins = require('localbitcoins-lib');


var context = new localbitcoins.LocalBitcoinsContext({
  useHmac: true,
  hmacKey: <hmac_key>,
  hmacSecret: <hmac_secret>
});

context.connect()
  .then(function (data) {
    console.log(context.myself.profile.username);

    // get the latest market data snapshot, interval in millisecond. 5000ms (5s) by default
    context.getLatestMarketDataSnapshot(intervalInMs)
      .then(function (snapshot) {
        // snapshot
      })
      .fail(function (error) {
        // error
      });

    // get the latest market data snapshot
    context.subscribeMarketDataSnapshot()
      .then(function () {
        // snapshot subscription done
      })
      .progress(function (snapshot) {
        // snapshot updates
      })
      .fail(function(error) {
        // error
      });

    setTimeout(function () {
      context.unsubscribeMarketDataSnapshot();
    }, 20000);

    context.loadWallet()
      .then(function (wallet) {
        console.log(wallet);
      })
      .fail(function (error) {
        console.error('Load wallet failed');
      });
  })
  .fail(function (error) {
    // error when make connection to localbitcoins
  });

```
