const store = require('./store')
const Joi = require('joi')
const _ = require('lodash')

function initEvents (options) {
  this.add(
    {
      role: 'events',
      cmd: 'get',
      filter: Joi.object().required()
    },
    (msg, reply) => {
      reply(null, store.get(msg.filter))
    }
  )

  this.add(
    {
      role: 'events',
      cmd: 'add',
      events: Joi.alternatives().try(Joi.array(), Joi.object()).required()
    },
    (msg, reply) => {
      const events = _.isArray(msg.events) ? msg.events : [msg.events]
      _.forEach(events, store.add)
      reply(null, { success: true })
      // setTimeout(() => {
      // Emit Events in nextTick

      _.forEach(events, e => {
        const publishEvent = Object.assign(
          {},
          {
            role: 'events',
            cmd: 'publish'
          },
          {
            // This is weirdly necessary, Might need a better solution for PUB/SUB
            default$: {}
          },
          e
        )
        this.act(publishEvent)
      })

      // }, 0)
    }
  )
  return 'event-store'
}

module.exports = initEvents
