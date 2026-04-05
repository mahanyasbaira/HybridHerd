require('dotenv').config();
const app = require('../src/app');

// Vercel serverless entry point — app.js exports Express without calling listen()
module.exports = app;
