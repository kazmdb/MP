const { randomDelay } = require('./utils');

async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            console.log(`🔄 Reintento ${i + 1}/${maxRetries}...`);
            await randomDelay(2000, 5000);
        }
    }
}

module.exports = { retryOperation };