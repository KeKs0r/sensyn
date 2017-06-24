const { EVENTS } = require('../../constants')

const orderEvents = [
  {
    type: EVENTS.ORDER_CREATED,
    id: 1,
    customer: {
      id: 5,
      name: 'Customer A'
    },
    product: {
      id: 3,
      name: 'Ebook'
    }
  },
  {
    type: EVENTS.ORDER_CONFIRMED,
    id: 2
  }
]

module.exports = orderEvents
