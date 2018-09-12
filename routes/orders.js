const Joi = require('joi')
const GROUP_NAME = 'orders'

module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}`,
    handler: async (request, reply) => {
        reply()
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'create order'
    }
}, {
    method: 'POST',
    path: `/${GROUP_NAME}/{orderId}/pay`,
    handler: async (request, reply) => {
        reply()
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'pay for good',
        validate: {
            params: {
                orderId: Joi.string().required()
            }
        }
    }
}]
