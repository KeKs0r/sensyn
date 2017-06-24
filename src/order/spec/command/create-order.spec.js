const Seneca = require('seneca')
const Promise = require('bluebird')
const { getCustomer, getProduct } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')

function testSeneca () {
  const s = Seneca({ log: 'test' })
    .test()
    .use('seneca-joi')
    .use(getCustomer)
    .use(getProduct)
    .use(require('../../command/create-order'))
  return Promise.promisify(s.act, {context: s})
}

function validationSeneca () {
  const s = Seneca({ log: 'silent' })
    .use('seneca-joi')
    .use(require('../../command/create-order'))
  return Promise.promisify(s.act, {context: s})
}

describe('1. Validation', () => {
  const act = validationSeneca()

  test('requires customer', () => {
    expect.assertions(2)
    return act({
      role: 'order',
      cmd: 'create',
      product: 5
    })
      .catch((err) => {
        expect(err).toBeTruthy()
        expect(err.details.message).toMatch(/customer/)
      })
  })

  test('requires product', () => {
    expect.assertions(2)
    return act({
      role: 'order',
      cmd: 'create',
      customer: 3
    })
      .catch((err) => {
        expect(err).toBeTruthy()
        expect(err.details.message).toMatch(/product/)
      })
  })
})

const command = {
  role: 'order',
  cmd: 'create',
  product: 1,
  customer: 2
}

describe('3. Load Context', () => {
  const act = testSeneca()

  test('Fetches Customer', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.customer).toMatchObject({
          id: 2,
          name: 'Customer A'
        })
      })
  })

  test('Fetches Product', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.product).toMatchObject({
          id: 1,
          name: 'Ebook'
        })
      })
  })
})

describe('4. Generate Events', () => {
  const act = testSeneca()

  test('order.created', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.event).toMatchObject({
          type: EVENTS.ORDER_CREATED,
          id: expect.anything(),
          product: expect.objectContaining({
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.objectContaining({
            id: 2,
            name: 'Customer A'
          })
        })
      })
  })
})

describe('5. Apply Events', () => {
  const act = testSeneca()

  test('apply', () => {
    expect.assertions(1)
    return act(command)
      .then((result) => {
        expect(result.apply).toMatchObject({
          id: expect.anything(),
          product: expect.objectContaining({
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.objectContaining({
            id: 2,
            name: 'Customer A'
          }),
          status: STATUS.OPEN
        })
      })
  })
})

describe('6. Commit', () => {
  test('Commit is not yet implemented')
})
