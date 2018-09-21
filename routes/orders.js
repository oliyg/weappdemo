const Joi = require('joi')
const crypto = require('crypto')
const xml2js = require('xml2js')
const axios = require('axios')
const { jwtHeaderDefine } = require('../utils/router-helper')
const GROUP_NAME = 'orders'
const models = require('../models')
const config = require('../config')

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
        // openid
        // const user = await models.users.findOne({ id: request.auth.credentials.userId })
        // const { open_id: openid } = user.dataValues
        // 建议使用 where 语句
        const user = await models.users.findOne({ where: { id: request.auth.credentials.userId } })
        const { openid } = user
        // 构造 unifiedorder
        const unifiedorderObj = {
            appid: config.wxAppid,
            mch_id: config.wxMchid,
            nonce_str: Math.random().toString(36).substr(2, 15), // 随机字符串 toString() radix argument must be between 2 and 36
            openid,
            // sign: null, // 随后生成
            body: '微信小程序支付', // 商品描述
            out_trade_no: request.params.orderId, // 订单号
            total_fee: 1,
            spbill_create_ip: request.info.remoteAddress, // 调用支付接口的用户 ip
            notify_url: 'https//localhost:3000/opay/notify', // 支付成功的回调地址
            trade_type: 'JSAPI'
        }
        // 签名数据
        const getSignData = (rawData, apiKey) => {
            let keys = Object.keys(rawData)
            keys = keys.sort()
            let string = ''
            keys.forEach(key => {
                string += `&${key}=${rawData[key]}`
            })
            string = string.substr(1) // 去掉第一个 &
            return crypto.createHash('md5').update(`${string}&key=${apiKey}`).digest('hex').toUpperCase()
        }
        // 获取签名
        const sign = getSignData(unifiedorderObj, config.wxPayApiKey)
        const unifiedorderWithSign = {
            ...unifiedorderObj,
            sign
        }
        // 转换为 xml 格式
        const builder = new xml2js.Builder({ rootName: 'xml', headless: true })
        const unifiedorderXML = builder.buildObject(unifiedorderWithSign)
        
        // 发送数据
        const result = await axios({
            method: 'POST',
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            data: unifiedorderXML,
            headers: { 'content-type': 'text/xml' }
        })
    
        // 将接收到的数据转为 json 返回前端，示例：
        // { return_code: [ 'SUCCESS' ],
        // return_msg: [ 'OK' ],
        // appid: [ 'wx2421b1c4370ec43b' ],
        // mch_id: [ '10000100' ],
        // nonce_str: [ 'IITRi8Iabbblz1Jc' ],
        // openid: [ 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o' ],
        // sign: [ '7921E432F65EB8ED0CE9755F0E86D72F' ],
        // result_code: [ 'SUCCESS' ],
        // prepay_id: [ 'wx201411101639507cbf6ffd8b0779950874' ],
        // trade_type: [ 'JSAPI' ] }
        xml2js.parseString(result.data, (err, parsedResult) => {
            if (parsedResult.xml) {
                if (parsedResult.xml.return_code[0] === 'SUCCESS' && parsedResult.xml.result_code[0] === 'SUCCESS') {
                    // 返回前端正确的预支付交易
                    // 待签名的原始支付数据
                    const replyData = {
                        apppId: parsedResult.xml.appid[0],
                        timeStamp: (Date.now() / 1000).toString(),
                        nonceStr: parsedResult.xml.nonce_str[0],
                        package: `prepay_id=${parsedResult.xml.prepay_id[0]}`,
                        signType: 'MD5'
                    }
                    replyData.paySign = getSignData(replyData, config.wxPayApiKey)
                    reply(replyData)
                }
            }
        })
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'pay for good',
        validate: {
            params: {
                orderId: Joi.string().required()
            },
            ...jwtHeaderDefine
        }
    }
}, {
    method: 'POST',
    path: `/${GROUP_NAME}/pay/notify`,
    handler: async (request, reply) => {
        // 示例：
        {/* <xml>
        <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
        <attach><![CDATA[支付测试]]></attach>
        <bank_type><![CDATA[CFT]]></bank_type>
        <fee_type><![CDATA[CNY]]></fee_type>
        <is_subscribe><![CDATA[Y]]></is_subscribe>
        <mch_id><![CDATA[10000100]]></mch_id>
        <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>
        <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>
        <out_trade_no><![CDATA[1409811653]]></out_trade_no>
        <result_code><![CDATA[SUCCESS]]></result_code>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>
        <sub_mch_id><![CDATA[10000100]]></sub_mch_id>
        <time_end><![CDATA[20140903131540]]></time_end>
        <total_fee>1</total_fee>
        <coupon_fee><![CDATA[10]]></coupon_fee>
        <coupon_count><![CDATA[1]]></coupon_count>
        <coupon_type><![CDATA[CASH]]></coupon_type>
        <coupon_id><![CDATA[10000]]></coupon_id>
        <coupon_fee><![CDATA[100]]></coupon_fee>
        <trade_type><![CDATA[JSAPI]]></trade_type>
        <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>
        </xml> */}
        xml2js.parseString(request.payload, async (err, parsedResult) => {
            if (parsedResult.xml.return_code[0] === 'SUCCESS') {
                // 各种校验省略。。。
                const orderId = parsedResult.xml.out_trade_no[0]
                const orderResult = await models.orders.findOne({ where: { id: orderId } })
                orderResult.payment_status = '1'
                await orderResult.save()
                // 返回微信，校验成功
                const retVal = {
                    return_code: 'SUCCESS',
                    return_msg: 'OK'
                };
                const builder = new xml2js.Builder({
                    rootName: 'xml',
                    headless: true
                });
                reply(builder.buildObject(retVal))
            }
        })
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'notification from weixin payment',
        auth: false
    }
}]
