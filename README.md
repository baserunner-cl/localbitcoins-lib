# localbitcoins-lib

This is a NodeJS client library for interfacing [localbitcoins](https://localbitcoins.com).

## Change Log

### Version 0.1

- Support Myself [reference](https://localbitcoins.com/api-docs/#api_toc1)
- Support Wallet [reference](https://localbitcoins.com/api-docs/#api_toc16)
- Support Quote (Tickers) [reference](https://localbitcoins.com/api-docs/#toc7)

### Version 0.2

- Support OrderBook and Trades [reference](https://localbitcoins.com/api-docs/#toc7)
- Refactored Quote, align the get latest and subscription functions

## Installation

`npm install localbitcoins-lib`

## Quick Start

## HMAC Key and Secret

In order to interface [localbitcoins](https://localbitcoins.com) with HMAC option, key and secret have to created beforehand. Please refer to [localbitcoins's API](https://localbitcoins.com/api-docs/#toc2) for more information

## Code Sample

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

    // get the latest order book snapshot
    // for **Trades**, same as **OrderBook** below - just replace _OrderBook_ with _Trades_
    // for **Quote**, no parameter is needed.
    context.OrderBook.getLatest({currency: 'HKD'})
      .then(function(orderbook) {
        // orderbook
      })
      .fail(function(error) {
        // error
      });

    // subscribe order book snapshot, interval in millisecond. 5000ms (5s) by default
    context.OrderBook.subscribe({ intervalInMs: 5000, currency: 'HKD'})
      .then(function() {
        // subscription done
      })
      .progress(function(orderbookUpdate) {
        // order book subscription update
      })
      .fail(function(error) {
        // order book subscription error
      });

    // just an example, to stop subscription after 20s
    setTimeout(function() {
      context.OrderBook.unsubscribe({currency: 'HKD'});
    }, 20000);

    // load wallet
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
