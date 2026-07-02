const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

exports.isValidObjectId = function (id) {
  if (!(id || ObjectId.isValid(id))) return false;

  const objectId = new ObjectId(id);
  if (objectId.toString() !== id) return false;

  return true;
};
