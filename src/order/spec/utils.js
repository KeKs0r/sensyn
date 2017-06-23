
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
}

module.exports = {
  getCustomer,
  getProduct
}
