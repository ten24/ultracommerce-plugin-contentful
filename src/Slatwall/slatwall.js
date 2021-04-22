const accounts = require('./accounts')
const products = require('./products')

module.exports = function (params) {
    return {
        products: { get: (data) => products.get(params, data) },
        accounts: {
            login: (data) => accounts.login(params, data),
            create: (data) => accounts.create(params, data),
        }
    }
}