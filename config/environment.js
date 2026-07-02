/* Map each environment variable to an object property
* for better usage
* */
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION_IN_MINUTES: process.env.JWT_EXPIRATION_IN_MINUTES,
  PMX_KEY: process.env.PMX_KEY,
  ATTOM_KEY: process.env.ATTOM_KEY,
  CORE_LOGIC_KEY: process.env.CORE_LOGIC_KEY,
  CORE_LOGIC_SECRET: process.env.CORE_LOGIC_SECRET,
  CORE_LOGIC_EMAIL: process.env.CORE_LOGIC_EMAIL,
  IP_API_KEY: process.env.IP_API_KEY,
  ENV: process.env.ENV,
  ELEVATEDACCESS: process.env.ELEVATEDACCESS,
};
