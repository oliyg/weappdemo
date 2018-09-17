const Joi = require('joi')
const GROUP_NAME = 'shops'
const models = require('../models')
const { paginationDefine } = require('../utils/router-helper')

module.exports = [{
    method: 'GET',
    path: `/${GROUP_NAME}`,
    handler: async (request, reply) => {
        const res = await models.shops.findAndCountAll({
            attributes: [
                'id', 'name'
            ],
            limit: request.query.limit,
            offset: (request.query.page - 1) * request.query.limit
        })
        const { rows: results, count: totalCount } = res
        // 开启分页的插件，返回的数据结构里，需要带上 result 与 totalCount 两个字段
        reply({ results, totalCount })
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'get shop list',
        validate: {
            query: {
                ...paginationDefine
            }
        }
    }
}, {
    method: 'GET',
    path: `/${GROUP_NAME}/{shopId}/goods`,
    handler: async (request, reply) => {
        const res = await models.goods.findAndCountAll({
            where: {
                shop_id: request.params.shopId
            },
            attributes: ['id', 'name'],
            limit: request.query.limit,
            offset: (request.query.page - 1) * request.query.limit
        })
        const { rows: results, count: totalCount } = res
        reply({ results, totalCount })
    },
    config: {
        // docs
        tags: ['api', GROUP_NAME],
        description: 'get current shop good list',
        // validation
        validate: {
            params: {
                shopId: Joi.number().required().description('shop id')
            },
            query: {
                ...paginationDefine
            }
        }
    }
}]
