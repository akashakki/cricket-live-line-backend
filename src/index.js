const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
console.log('config.env===>>', config.env, config.mongoose)
let db_url;
let port;
if (config.env == "production") {
    db_url = `mongodb://${encodeURIComponent(config.mongoose.user)}:${encodeURIComponent(config.mongoose.pass)}@65.0.7.154:27017/CricketLiveOddsLineDB?authSource=admin`;
    port = config.port;
} else {
    db_url = config.mongoose.url;
    port = config.port;
}
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(port, () => {
        logger.info(`Server listening on port ${port}`);
    });
}).catch(err => {
    logger.error(`MongoDB connection error: ${err.message}`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});