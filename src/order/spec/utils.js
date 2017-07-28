
function getCustomer (customer) {
  const defaultCustomer = {
    name: 'Customer A',
    classification: 1
  }
  this.add({
    role: 'customer',
    cmd: 'get'
  }, (msg, reply) => {
    reply(null, Object.assign({}, defaultCustomer, customer, {id: msg.id}))
  })
  return 'mock-customer'
}

function getOrder (order) {
  this.add({
    role: 'order',
    cmd: 'get'
  }, (msg, reply) => reply(order))
  return 'mock-get-order'
}

function getProduct (product) {
  const defaultProduct = {
    name: 'Ebook',
    price: 9.99
  }

  this.add({
    role: 'product',
    cmd: 'get'
  }, (msg, reply) => {
    reply(null, Object.assign({}, defaultProduct, product, {id: msg.id}))
  })
  return 'mock-product'
}

function eventStore () {
  const events = require('./fixtures/events')
  this.add({
    role: 'events',
    cmd: 'get'
  }, (msg, reply) => reply(events))
  this.add({
    role: 'events',
    cmd: 'add'
  }, (msg, reply) => reply(null, {success: true}))
  return 'mock-events'
}

module.exports = {
  getCustomer,
  getProduct,
  eventStore,
  getOrder
}
