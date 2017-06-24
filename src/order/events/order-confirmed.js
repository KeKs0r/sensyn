const { STATUS } = require('../constants')

function applyOrderConfirmed (current, event) {
  return Object.assign({}, current, {
    status: STATUS.CONFIRMED
  })
}

module.exports = applyOrderConfirmed
