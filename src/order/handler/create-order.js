const uuid = require('uuid')
const { STATUS } = require('../constants')
const Async = require('async')
const Joi = require('joi')

const pattern = {
  role: 'order',
  cmd: 'create',
  customer: Joi.number().required(),
  product: Joi.number().required()
}

function applyOrderEvent (current, event) {
  const order = {
    id: event.id,
    // prices: prices(action),
    customer: event.customer,
    product: event.product,
    status: STATUS.OPEN
  }
  return order
}

function applyOrderCommand (customer, product) {
  const orderCreated = {
    type: 'order.created',
    id: uuid.v4(),
    customer,
    product
  }
  return orderCreated
}

function init (options) {
  this
    .add(pattern, (msg, reply) => {
      Async.auto({
        customer: (next) => {
          this.act({
            role: 'customer',
            cmd: 'get',
            id: msg.customer
          }, next)
        },
        product: (next) => {
          this.act({
            role: 'product',
            cmd: 'get',
            id: msg.product
          }, next)
        },
        event: ['customer', 'product', (res, next) => {
          const events = applyOrderCommand(res.customer, res.product)
          next(null, events)
        }],
        apply: ['event', (res, next) => {
          const applied = applyOrderEvent(null, res.event)
          next(null, applied)
        }],
        commit: ['apply', 'event', (res, next) => {
          // Now we should persist the event
          next(null, {success: true})
        }]
      }, (err, res) => {
        if (err) return reply(err)
        // we return everything, but an API endpoint should probably clean this up
        reply(null, res)
      })
    })

  return 'order-create'
}

module.exports = init
