const { orderTypes } = require('./order-schema');
const { sendMessageWithClient } = require('../utils/utils');

/**
 * I have implemented here a basic serch by iterating over all available orders in order to find the closest match
 * A better approach will be to use graphs and use an algorithm like dijkstra to find the best match in an optimised manner
 */

const findBestOrderMatch = (order, db) => {
  const matchType = orderTypes.reverseOrderType(order.type);

  let match = {
    amount: Number.POSITIVE_INFINITY
  };

/**
 * Check for three possible conditions that can affect the matching process.
 *  - Order match type is the same
 *  - The owner of the transaction is not matched to his own order
 *  - A locked order is not matched again
 */
  for (let key in db) {
    if (db[key].type !== matchType || db[key].orderedBy === order.orderedBy || db[key].lock) {
      continue;
    }
    
    if (Math.abs(db[key].amount - order.amount) < Math.abs(match.amount - order.amount)) {
      match = { ...db[key] };
    }
  }

  return match.amount !== Number.POSITIVE_INFINITY && match;
};


module.exports = (db = {}, orderedBy = 0) => {
  const orderProcessor = require('./order-process')(db);

  return async (order, peerClient) => {
    db[order.id] = order;

    const sendMessageToAllClients = sendMessageWithClient(peerClient);

    await sendMessageToAllClients({ type: 'INITIAL_ORDER', data: order, orderedBy });

    const matchFound = findBestOrderMatch(order, db);

    if (!matchFound) {
      console.log('No match found.');
      orderProcessor.unlockOrder(order);
      return;
    }

    const { data } = await sendMessageToAllClients({ type: 'LOCK_ORDER', data: { ...match, lockedBy: order.orderedBy }, orderedBy });

    await sendMessageToAllClients({ type: 'VERIFY_TRANSACTION', data: { orderId: order.id, matchedId: match.id }, orderedBy });

    const { updatedMatch, updatedOrder } = processor.updateOrder(match, order);

    await sendMessageToAllClients({
      type: 'UPDATE_ORDER',
      data: {
        match,
        order,
        updatedMatch,
        updatedOrder
      },
      orderedBy
    });

    console.log(db);
  };
};
