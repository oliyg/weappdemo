module.exports = [{
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        reply('hello hapi')
    },
    config: {
        tags: ['api', 'tests'],
        description: 'testing hello hapi'
    }
}]
