const Joi = require('joi')
const GROUP_NAME = 'shops'

module.exports = [{
    method: 'GET',
    path: `/${GROUP_NAME}`,
    handler: (request, reply) => {
        reply()
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'get shop list'
    }
}, {
    method: 'GET',
    path: `/${GROUP_NAME}/{shopId}/goods`,
    handler: (request, reply) => {
        reply()
    },
    config: {
        // docs
        tags: ['api', GROUP_NAME],
        description: 'get current shop good list',
        // validation
        validate: {
            params: {
                shopId: Joi.number().required()
            }
        }
    }
}]
