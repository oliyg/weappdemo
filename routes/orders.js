const Joi = require('joi')
const { jwtHeaderDefine } = require('../utils/router-helper')
const GROUP_NAME = 'orders'
const models = require('../models')

module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}`,
    handler: async (request, reply) => {
        // * 接收的参数示例
        // {"goodsList": [{
        //     "goods_id": 0,
        //     "count": 0
        // }]}
        // 开启事务
        await models.sequelize.transaction((t) => {
            // * models.orders.create() 在 orders 中创建数据
            const result = models.orders.create({
                user_id: request.auth.credentials.userId // 解密 jwt 后的 userid
            }, {
                transaction: t
            }).then(order => {
                const goodsList = [] // promise 任务列表
                request.payload.goodsList.forEach(item => {
                    // * models.order_goods.create() 在 order_goods 创建订单详情
                    goodsList.push(models.order_goods.create({
                        order_id: order.dataValues.id, // 在orders 表中创建的数据中 id 的值关联到 order_id
                        goods_id: item.goods_id,
                        single_price: 4.9, // 假设值；需要通过从商品表中反查在 seeders 中的 init-good 加上每件商品的单价 
                        count: item.count
                    }))
                })
                return Promise.all(goodsList)
            })
            return result
        }).then(() => { reply('success') }).catch(() => { reply('error') })
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'create order',
        validate: {
            payload: {
                goodsList: Joi.array().items(
                    Joi.object().keys({
                        goods_id: Joi.number().integer(),
                        count: Joi.number().integer()
                    })
                )
            },
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
