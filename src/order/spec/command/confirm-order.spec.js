const Seneca = require('seneca')
const Promise = require('bluebird')
const { getOrder } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')

const orderFixture = {
  id: 3,
  status: STATUS.OPEN
}

const command = {
  role: 'order',
  cmd: 'confirm',
  order: 3
}

function testSeneca () {
  const s = Seneca({ log: 'test' })
    .test()
    .use('seneca-joi')
    .use(getOrder, orderFixture)
    .use(require('../../command/confirm-order'))
  return Promise.promisify(s.act, {context: s})
}

function validationSeneca () {
  const s = Seneca({ log: 'silent' })
    .use('seneca-joi')
    .use(require('../../command/confirm-order'))
  return Promise.promisify(s.act, {context: s})
}

describe('1. Validation', () => {
  const act = validationSeneca()

  test('Requires order', () => {
    expect.assertions(2)
    return act({
      role: 'order',
      cmd: 'confirm'
    })
      .catch((err) => {
        expect(err).toBeTruthy()
        expect(err.details.message).toMatch(/order/)
      })
  })
})

describe('2. Load Aggregate', () => {
  const act = testSeneca()

  test('Fetches Order', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.order).toMatchObject(orderFixture)
      })
  })
})

describe('4. Generate Events', () => {
  const act = testSeneca()

  test('Order Confirmed', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.event).toMatchObject({
          type: EVENTS.ORDER_CONFIRMED,
          id: command.order
        })
      })
  })
})

describe('5. Apply Events', () => {
  const act = testSeneca()

  test('apply Order Created', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.apply).toMatchObject({
          id: command.order,
          status: STATUS.CONFIRMED
        })
      })
  })
})

describe('6. Commit', () => {
  test('Commit is not yet implemented')
})
