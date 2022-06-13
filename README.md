# Bitfinex Coding Challenge

The task is to create a simplified distributed exchange
* Each client will have its own instance of the orderbook.
* Clients submit orders to their own instance of orderbook. The order is distributed to other instances, too.
* If a client's order matches with another order, any remainer is added to the orderbook, too.

# Get Started

-   Clone the repository using git clone https://github.com/deejaycodes/bitfinex-coding-challenge.git

-   Run `npm i` or `npm install` to install all app dependencies
```

## Start the grape server using  : 
    - ` grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002`
    -  `grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'`

* Start up multiple instances of the exchange service by running npm start in multiple terminals.
* Trigger the exchange service by calling the matchOrder function with different orders.
