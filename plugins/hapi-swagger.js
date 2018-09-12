const inert = require('inert')
const vision = require('vision')
const package = require('package')
const hapiSwagger = require('hapi-swagger')

module.exports = [
    inert,
    vision,
    {
        register: hapiSwagger,
        options: {
            info: {
                title: 'weapp API document',
                version: package.version
            },
            grouping: 'tags',
            tags: [
                { name: 'tests', description: 'something about testing api' }
            ]
        }
    }
]
