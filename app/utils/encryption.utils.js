const crypto = require('crypto');
const environment = require('../../config/environment');

const algorithm = 'aes-192-cbc';
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
const key = crypto.scryptSync(environment.JWT_SECRET, 'salt', 24);
// Initialize crypto vector
const iv = Buffer.alloc(16, 0);

exports.createEncryption = function (text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryption = cipher.update(text, 'utf8', 'hex');
  encryption += cipher.final('hex');
  return encryption;
};

exports.decryptEncryption = function (encryption) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryption, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
