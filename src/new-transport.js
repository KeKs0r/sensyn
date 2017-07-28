const Seneca = require('seneca')
const Promise = require('bluebird')

const s = Seneca({
  log: 'test',
  legacy: {
    transport: false
  }
}).use(require('./eventstore/handlers'))
const act = Promise.promisify(s.act, { context: s })
act({
  role: 'events',
  cmd: 'add',
  events: {
    id: 1,
    context: 3
  }
})
  .then(console.log)
  .catch(console.error)
  .then(() => Promise.delay(100))
