const Joi = require('joi')
const _ = require('lodash')
const applyOrderEvent = require('../apply')

const pattern = {
  role: 'order',
  cmd: 'get',
  order: Joi.number().required()
}

function init (options) {
  this
    .add(pattern, (msg, reply) => {
      this.act({
        role: 'events',
        cmd: 'get',
        filter: {
          order: msg.order
        }
      }, (err, events) => {
        if (err) return reply(err)
        const order = _.reduce(events, applyOrderEvent, {})
        reply(null, order)
      })
    })
  return 'order-confirm'
}

module.exports = init
