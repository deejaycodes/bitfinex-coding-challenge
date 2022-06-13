const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const matcher = require('./order/order-match');
const processor = require('./order/order-process');
const { Order, orderTypes } = require('./order/order-schema');

var db = {};

const { asyncHandlers } = processor(db);

const serverLink = new Link({
  grape: 'http://127.0.0.1:30001'
});
serverLink.start();

const peerServer = new PeerRPCServer(serverLink, {
  timeout: 300000
});
peerServer.init();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peerServer.transport('server');
service.listen(port);

setInterval(function () {
  serverLink.announce(`exchange_server`, service.port, {});
}, 1000);

const clientLink = new Link({
  grape: 'http://127.0.0.1:30001'
});
clientLink.start();

const peerClient = new PeerRPCClient(clientLink, {});
peerClient.init();

service.on('request', (rid, key, payload, handler) => {
  if (payload.orderedBy === port) return;

  asyncHandlers(payload, handler.reply);
});

const matchOrder = matcher(db, port);

// Get current order state
peerClient.map('exchange_server', {
  type: 'GET_ORDER_STATE',
  from: port
}, { timeout: 10000 }, (err, data) => {

  if (data && data.length && data[0]) {
    db = Object.assign(db, { ...data[0].db });
  }
  
  try {
    // TODO process the order
    
    matchOrder(new Order({ type: orderTypes.buy, amount: 300, orderedBy: port, }), peerClient);
  } catch (error) {
    console.error(error);
  }

});