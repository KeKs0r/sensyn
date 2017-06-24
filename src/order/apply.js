const { EVENTS } = require('./constants')

const orderCreated = require('./events/order-created')

function apply (current, event) {
  switch (event.type) {
    case EVENTS.ORDER_CREATED :
      return orderCreated(current, event)
    default:
      console.warn(`Event ${event.type} not found`)
      return current
  }
}

module.exports = apply
