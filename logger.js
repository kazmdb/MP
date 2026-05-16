const fs = require('fs-extra');
const path = require('path');
const config = require('./config.json');

class Logger {
    constructor(type) {
        this.type = type;
        this.logFile = path.join(config.logFolder, `${type}.log`);
    }

    async log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;

        console.log(logMessage.trim());
        await fs.appendFile(this.logFile, logMessage);
    }

    async info(message) {
        await this.log(message, 'INFO');
    }

    async error(message) {
        await this.log(message, 'ERROR');
    }

    async success(message) {
        await this.log(message, 'SUCCESS');
    }

    async warning(message) {
        await this.log(message, 'WARNING');
    }
}

module.exports = Logger;