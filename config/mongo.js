const mongoose = require('mongoose');
const path = require('path');
const loadModels = require('../app/models');
const environment = require('./environment');

async function createMongoConnection() {
  console.info(path.resolve(__dirname, '../rds-combined-ca-bundle.pem'));
  try {
    await mongoose.connect(environment.DATABASE_URL, {
      autoIndex: false,
      // keepAlive: true,
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
      // ssl: true,
      // sslValidate: true,
      // sslCA: path.resolve(__dirname, '../rds-combined-ca-bundle.pem'),
      // // sslCAFile: path.resolve(__dirname, '../rds-combined-ca-bundle.pem'),
      // retryWrites: false,
      // tlsCAFile: 'rds-combined-ca-bundle.pem', // path.resolve(__dirname, '../rds-combined-ca-bundle.pem'),
    });
    console.info('****************************');
    console.info('*    Starting Server');
    console.info(`*    Port: ${process.env.PORT}`);
    console.info(`*    NODE_ENV: ${process.env.NODE_ENV}`);
    console.info('*    Database: MongoDB');
    console.info('*    DB Connection: OK\n****************************\n');
  } catch (error) {
    console.error(error)
    console.info('');
    console.info('****************************');
    console.info(`*    Error connecting to DB: ${error.message}\n****************************\n`);
    // TODO: Emit error to company emails
    process.exit(-1);
  }
}

function mongooseConnectionErrorListener(error) {
  console.error(error)
    console.info('');
  // TODO: Emit error to company emails
  process.exit(-1);
}

mongoose.connection.on('error', mongooseConnectionErrorListener);
// mongoose.connection.on('disconnected', createMongoConnection);

module.exports = async () => {
  await createMongoConnection();
  loadModels();
};
