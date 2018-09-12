const Hapi = require('hapi')
require('env2')('./.env') // process env generated by env2
const config = require('./config')
const pluginHapiSwagger = require('./plugins/hapi-swagger')

// ! 此处还是建议采用统一的 routes 入口文件 index.js
// ! require 太多 routes 会导致代码量增加降低可读性
// ! 建议使用 blob 方法统一获取 routes 文件夹下的所有路由
const routesHelloWorld = require('./routes/hello-world') // routes
const routesShops = require('./routes/shops')

const server = new Hapi.Server()

// env config
server.connection({
    port: config.port,
    host: config.host
})

const init = async () => {
    // plugins register
    await server.register([
        ...pluginHapiSwagger
    ])

    // routes activator
    server.route([
        ...routesHelloWorld,
        ...routesShops
    ])

    await server.start()

    console.log(`Server running at ${server.info.uri}`)
}

init()
