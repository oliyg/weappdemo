const JWT = require('jsonwebtoken')
const Joi = require('joi')
const axios = require('axios')
const config = require('../config')
const decryptData = require('../utils/decrypted-data')
const models = require('../models')

const GROUP_NAME = 'users'

module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}/createJWT`,
    handler: async function (request, reply) {
        const generateJWT = jwtInfo => {
            const payload = {
                userId: jwtInfo.userId,
                exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60
            }
            return JWT.sign(payload, process.env.JWT_SECRET) // 将 secret 放置在配置文件中
            // ! 业务逻辑中直接使用 process.env.JWT_SECRET 而不是 config.jwtSecret
        }
        reply(generateJWT({
            userId: 1
        }))
    },
    config: {
        tags: ['api', GROUP_NAME],
        description: 'testing generate signed JWT',
        auth: false // hapi-auth-jwt2 对 jwt 的认证；该路由不需要认证
    }
}, {
    method: 'POST',
    path: `/${GROUP_NAME}/wxLogin`,
    handler: async function (request, reply) {
        const appid = config.wxAppid
        const secret = config.wxSecret
        const { code, encryptedData, iv } = request.payload

        const response = await axios({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            method: 'GET',
            params: { // 通过 appid secret 以及 code 换取 openid 和 session_key
                appid,
                secret,
                js_code: code
            }
        })

        const { openid, session_key: sessionKey } = response.data // 获取到 openid 和 session_key
        // openid 用来查看 users 数据表中是否存在该用户
        // session_key 则是需要与 encryptedData 和 iv 匹配，用来获取用户信息

        // ! 服务端 500 错误且无特殊 error message 很可能是 decryptData 传入的参数不正确
        // 检查是否存在该用户 没有则创建
        const user = await models.users.findOrCreate({
            where: { open_id: openid }
        })
        
        const userInfo = decryptData(encryptedData, iv, sessionKey, config.wxAppid) // ! 注意在 session_key 改名为 sessionKey 后前者不可用

        // 根据 openid 更新数据
        await models.users.update({
            nick_name: userInfo.nickName,
            gender: userInfo.gender,
            avatar_url: userInfo.avatarUrl,
            open_id: openid,
            session_key: sessionKey
        }, {
            where: { open_id: openid }
        })

        // generate JWTtoken
        const generateJWT = jwtInfo => {
            const payload = { userId: jwtInfo.userId, exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60 }
            return JWT.sign(payload, config.jwtSecret)
        }

        reply(generateJWT({
            userId: user[0].id // 数据库中获取对应的 id 作为 userId
        }))

    },
    config: {
        tags: ['api', GROUP_NAME],
        auth: false,
        description: 'testing wxlogin',
        validate: {
            payload: {
                code: Joi.string().required().description('temp code from wxlogin api'),
                encryptedData: Joi.string().required().description('encrypted data from wxlogin api'),
                iv: Joi.string().required().description('encrypting iv from wxlogin api')
            }
        }
    }
}]
