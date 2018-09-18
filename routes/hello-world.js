const { jwtHeaderDefine } = require('../utils/router-helper')

module.exports = [{
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        console.log(request.auth.credentials) // * 验证成功打印包含 userId 的对象
        reply('hello hapi')
    },
    config: {
        tags: ['api', 'tests'],
        description: 'testing hello hapi',
        validate: {
            ...jwtHeaderDefine
        }
    }
}]
