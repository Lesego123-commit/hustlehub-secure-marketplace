// config/db.js — MongoDB Connection with Mongoose
// Establishes and manages the connection to MongoDB with automatic retry logic.
// We connect once at startup and let Mongoose handle connection pooling.
//
// Mongoose connection docs: https://mongoosejs.com/docs/connections.html
// MongoDB Node.js driver connection guide:
// https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/
// Mongoose connection events: https://mongoosejs.com/docs/connections.html#connection-events
// Retry pattern based on exponential backoff:
// https://docs.aws.amazon.com/general/latest/gr/api-retries.html

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

// Maximum number of connection retry attempts before giving up
const MAX_RETRIES = 5;
// Base delay in ms between retries (doubles each attempt)
const RETRY_DELAY = 3000;

// Connect to MongoDB with retry logic. If the first attempt fails,
// we retry up to MAX_RETRIES times with increasing delays.
// Ref: https://mongoosejs.com/docs/connections.html#error-handling
const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info(`MongoDB connected successfully to ${config.mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
      return;
    } catch (err) {
      retries += 1;
      logger.error(`MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${err.message}`);

      if (retries >= MAX_RETRIES) {
        logger.error('Max MongoDB connection retries reached. Exiting process.');
        process.exit(1);
      }

      // Wait before retrying — delay increases with each attempt
      const delay = RETRY_DELAY * retries;
      logger.warn(`Retrying MongoDB connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Log disconnection and error events so we know if the connection drops
// Ref: https://mongoosejs.com/docs/connections.html#connection-events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;
