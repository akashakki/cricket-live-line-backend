const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
    openapi: '3.0.0',
    info: {
        title: 'Omnist API (APIKART)',
        version,
        // license: {
        //     name: 'MIT',
        //     url: '',
        // },
    },
    servers: [
        {
            url: `http://localhost:${config.port}/v1`,
        },
        {
            url: 'https://api.example.com/v1',
        },
        // Add more server URLs as needed
    ],
};

module.exports = swaggerDef;
