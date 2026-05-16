const fs = require('fs-extra');
const path = require('path');
const config = require('./config.json');

// Función de delay aleatorio
function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Obtener User-Agent aleatorio
function getRandomUserAgent() {
    const agents = config.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
}

// Verificar si archivo existe
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Obtener extensión de archivo válida
function getValidExtension(url) {
    const validExtensions = config.imageFormats;
    for (const ext of validExtensions) {
        if (url.toLowerCase().includes(ext)) {
            return ext;
        }
    }
    return '.jpg'; // Default
}

// Limpiar nombre de archivo
function sanitizeFileName(name) {
    return name
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

module.exports = {
    randomDelay,
    getRandomUserAgent,
    fileExists,
    getValidExtension,
    sanitizeFileName
};