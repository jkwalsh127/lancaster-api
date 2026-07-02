exports.sendApiErrorResponse = function (res, data, error, status = 400) {
  console.error(error)
  console.info('');
  res.status(status).json({
    status: 'error',
    data,
    message: typeof error === 'string' ? error : error.message,
  });
};

exports.sendApiSuccessResponse = function (res, data, message) {
  res.status(200).json({
    status: 'success',
    data,
    message,
  });
};
