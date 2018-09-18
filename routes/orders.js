const Joi = require('joi')
const { jwtHeaderDefine } = require('../utils/router-helper')
const GROUP_NAME = 'orders'

module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}`,
    handler: async (request, reply) => {
        reply()
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'create order',
        validate: {
            ...jwtHeaderDefine
        }
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
