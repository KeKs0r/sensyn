const _ = require('lodash')

const events = []

function add (event) {
  events.push(event)
}

function get (filter) {
  return _.filter(events, filter)
}

module.exports = {
  add,
  get
}
