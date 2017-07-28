const Seneca = require('seneca')
const Promise = require('bluebird')

const s = Seneca({
  log: 'test',
  legacy: {
    transport: true
  }
})
  .test()
  .use('seneca-joi')
  .use(require('./handlers'))
const act = Promise.promisify(s.act, { context: s })

test('validates event', () => {
  const testS = Seneca({
    log: 'silent',
    legacy: {
      transport: false
    }
  })
    .use('seneca-joi')
    .use(require('./handlers'))
  const testAct = Promise.promisify(testS.act, { context: testS })

  expect.assertions(1)
  return testAct({
    role: 'events',
    cmd: 'add',
    events: 1
  }).catch(err => {
    expect(err).toBeTruthy()
  })
})

test.only('can add single event', () => {
  return act({
    role: 'events',
    cmd: 'add',
    events: {
      id: 1,
      context: 3
    }
  })
})

test('can add multiple events', () => {
  return act({
    role: 'events',
    cmd: 'add',
    events: [{ id: 2, context: 3, c: 4 }, { id: 3, c: 3 }]
  })
})

test('can receive filtered events', () => {
  expect.assertions(1)
  return act({
    role: 'events',
    cmd: 'get',
    filter: { context: 3 }
  }).then(events => {
    expect(events).toHaveLength(2)
  })
})

describe.skip('events can be observed', () => {
  const spy1 = jest.fn(function () {
    console.log('spy1')
    this.good()
  })
  const spy2 = jest.fn(function () {
    console.log('spy2')
    this.good()
  })

  const discover = {
    stop: true,
    guess: { active: true },
    multicast: { active: false },
    registry: { active: false }
  }
  const base = Seneca({ log: 'silent', tag: 'base' }).use('mesh', {
    isbase: true,
    discover,
    sneeze: { silent: true }
  })
  const baseReady = Promise.promisify(base.ready, { context: base })
  const baseClose = Promise.promisify(base.close, { context: base })
  const sub1 = Seneca({ log: 'silent', tag: 'sub1' })
    .add(
      {
        role: 'events',
        cmd: 'publish',
        type: 'test'
      },
      spy1
    )
    .use('mesh', {
      discover,
      listen: [{ pin: 'role:events', model: 'observe' }],
      sneeze: { silent: true }
    })
  const sub1Ready = Promise.promisify(sub1.ready, { context: sub1 })
  const sub1Close = Promise.promisify(sub1.close, { context: sub1 })

  const sub2 = Seneca({ log: 'silent', tag: 'sub2' })
    .add(
      {
        role: 'events',
        cmd: 'publish',
        type: 'test'
      },
      spy2
    )
    .use('mesh', {
      discover,
      listen: [{ pin: 'role:events', model: 'observe' }],
      sneeze: { silent: true }
    })
  const sub2Ready = Promise.promisify(sub2.ready, { context: sub2 })
  const sub2Close = Promise.promisify(sub2.close, { context: sub2 })

  const pub = Seneca({ log: 'silent', tag: 'pub' })
    // .test() // Message Sent to yourself --> Warning
    .use(require('./handlers'))
    .use('mesh', {
      discover,
      sneeze: { silent: true }
    })
  const pubReady = Promise.promisify(pub.ready, { context: pub })
  const pubClose = Promise.promisify(pub.close, { context: pub })
  const pubAct = Promise.promisify(pub.act, { context: pub })
  beforeAll(() => {
    return baseReady().then(() => sub1Ready()).then(() => sub2Ready()).then(() => pubReady())
  })

  afterAll(() => {
    return pubClose()
      .then(() => sub1Close())
      .then(() => sub2Close())
      .then(() => baseClose())
      .then(() => console.log('done'))
  })

  test('events can be observed', () => {
    expect.assertions(4)
    return pubAct({
      role: 'events',
      cmd: 'add',
      events: {
        type: 'test'
      }
    })
      .then(() => Promise.delay(100))
      .then(() => {
        expect(spy1).toHaveBeenCalled()
        expect(spy2).toHaveBeenCalled()
      })
      .then(() =>
        pubAct({
          role: 'events',
          cmd: 'add',
          events: {
            type: 'other'
          }
        })
      )
      .then(() => Promise.delay(100))
      .then(() => {
        console.log('second assert')
        expect(spy1).toHaveBeenCalledTimes(1)
        expect(spy2).toHaveBeenCalledTimes(1)
      })
  })
})
