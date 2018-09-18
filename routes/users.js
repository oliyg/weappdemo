const JWT = require('jsonwebtoken')

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
}]
