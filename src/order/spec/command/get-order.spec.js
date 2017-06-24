const Seneca = require('seneca')
const Promise = require('bluebird')
const { getEvents } = require('../utils')

const s = Seneca({ log: 'test' })
  .test()
  .use('seneca-joi')
  .use(getEvents)
  .use(require('../../command/get-order'))
const act = Promise.promisify(s.act, {context: s})

test('Get Order', () => {
  expect.assertions(2)
  return act({
    role: 'order',
    cmd: 'get',
    order: 1
  })
    .then((order) => {
      expect(order).toBeTruthy()
      expect(order).toMatchObject({
        id: 1
      })
    })
})
