const Seneca = require('seneca')
const Promise = require('bluebird')

const s = Seneca({ log: 'test' })
  .test()
  .use('seneca-joi')
  .use(require('./handlers'))
const act = Promise.promisify(s.act, {context: s})

test('validates event', () => {
  const testS = Seneca({ log: 'silent' })
    .use('seneca-joi')
    .use(require('./handlers'))
  const testAct = Promise.promisify(testS.act, {context: testS})

  expect.assertions(1)
  return testAct({
    role: 'events',
    cmd: 'add',
    event: 1
  }).catch((err) => {
    expect(err).toBeTruthy()
  })
})

test('can add single event', () => {
  return act({
    role: 'events',
    cmd: 'add',
    event: {
      id: 1,
      context: 3
    }
  })
})
test('can add multiple events', () => {
  return act({
    role: 'events',
    cmd: 'add',
    event: [
      { id: 2, context: 3, c: 4 },
      { id: 3, c: 3 }
    ]
  })
})

test('can receive filtered events', () => {
  expect.assertions(1)
  return act({
    role: 'events',
    cmd: 'get',
    filter: {context: 3}
  }).then((events) => {
    expect(events).toHaveLength(2)
  })
})
