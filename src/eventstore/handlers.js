const store = require('./store')
const Joi = require('joi')
const _ = require('lodash')

function initEvents (options) {
  this.add({
    role: 'events',
    cmd: 'get',
    filter: Joi.object().required()
  }, (msg, reply) => {
    reply(null, store.get(msg.filter))
  })
  this.add({
    role: 'events',
    cmd: 'add',
    event: Joi.alternatives().try(Joi.array(), Joi.object()).required()
  }, (msg, reply) => {
    if (_.isArray(msg.event)) {
      _.forEach(msg.event, store.add)
    } else {
      store.add(msg.event)
    }
    reply(null, {success: true})
  })
  return 'event-store'
}

module.exports = initEvents
