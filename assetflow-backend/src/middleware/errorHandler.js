const ApiError = require('../utils/ApiError')

module.exports = function errorHandler(err, req, res, next) {
  const isApi = err instanceof ApiError
  const statusCode = isApi ? err.statusCode : 500

  const payload = {
    success: false,
    error: {
      message: isApi ? err.message : 'Internal server error',
      details: isApi ? err.details : undefined
    }
  }

  if (process.env.NODE_ENV !== 'production' && !isApi) {
    payload.error.stack = err?.stack
    payload.error.name = err?.name
  }

  res.status(statusCode).json(payload)
}
