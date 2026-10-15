// server.js — HTTPS/HTTP Server Entry Point
// Connects to MongoDB first, then starts the HustleHub+ API with TLS encryption
// using self-signed certificates. Falls back to plain HTTP if no certs are found.
//
// We followed the Node.js HTTPS docs for setting up the secure server:
// https://nodejs.org/api/https.html
// and the OWASP Transport Layer Security Cheat Sheet for best practices:
// https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
// Mongoose connection guide: https://mongoosejs.com/docs/connections.html
// Winston logging: https://www.npmjs.com/package/winston

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const startServer = async () => {
  // Connect to MongoDB before starting the HTTP server.
  // If the connection fails after retries, the process exits (handled in db.js).
  await connectDB();

  const certPath = path.join(config.certsDir, 'server.pem');
  const keyPath = path.join(config.certsDir, 'server-key.pem');

  const httpsAvailable = fs.existsSync(certPath) && fs.existsSync(keyPath);

  if (httpsAvailable) {
    // Read the SSL cert and private key so Node can do TLS
    // Ref: https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
    const sslOptions = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };

    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(config.port, () => {
      logger.info(`[HTTPS] HustleHub+ API running securely on https://localhost:${config.port}`);
      logger.info(`[ENV] ${config.nodeEnv}`);
    });

    // Redirect HTTP traffic to HTTPS with a 301 so nothing goes over plaintext.
    // OWASP recommends redirecting all HTTP to HTTPS.
    const httpServer = http.createServer((req, res) => {
      res.writeHead(301, { Location: `https://localhost:${config.port}${req.url}` });
      res.end();
    });
    httpServer.listen(3000, () => {
      logger.info('[HTTP] Redirecting HTTP:3000 -> HTTPS');
    });
  } else {
    logger.warn('[WARNING] SSL certificates not found. Running on HTTP only.');
    logger.warn('[WARNING] Generate certificates by running: npm run generate-certs');
    const httpServer = http.createServer(app);
    httpServer.listen(config.port, () => {
      logger.info(`[HTTP] HustleHub+ API running on http://localhost:${config.port}`);
      logger.info(`[ENV] ${config.nodeEnv}`);
    });
  }
};

startServer();
