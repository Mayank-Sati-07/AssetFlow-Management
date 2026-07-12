const ApiError = require('../utils/ApiError')

module.exports = function requirePermission(action) {
  return function rbacMiddleware(req, _res, _next) {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated')
    }

    if (!req.user.permissions?.includes(action)) {
      throw ApiError.forbidden(`Missing permission: ${action}`)
    }
  }
}
