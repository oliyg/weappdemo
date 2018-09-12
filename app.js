const Hapi = require('hapi')
require('env2')('./.env') // process env generated by env2
const config = require('./config')

// ! 此处还是建议采用统一的 routes 入口文件 index.js
// ! require 太多 routes 会导致代码量增加降低可读性
// ! 建议使用 blob 方法统一获取 routes 文件夹下的所有路由
const helloworld = require('./routes/hello-world') // routes

const server = new Hapi.Server()

// env config
server.connection({
    port: config.port,
    host: config.host
})

const init = async () => {
    // routes activator
    server.route([
        ...helloworld
    ])

    await server.start()

    console.log(`Server running at ${server.info.uri}`)
}

init()