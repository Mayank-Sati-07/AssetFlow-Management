const jwt = require('jsonwebtoken')

const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

function parseBearerToken(req) {
  const header = req.headers.authorization
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null

  return token
}

module.exports = asyncHandler(async function authMiddleware(req, _res, _next) {
  const token = parseBearerToken(req)
  if (!token) {
    throw ApiError.unauthorized('Missing Bearer token')
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw ApiError.unauthorized('Invalid token')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } }
            }
          }
        }
      }
    }
  })

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or inactive')
  }

  const roles = user.roles.map((ur) => ur.role.name)
  const permissions = new Set()
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      permissions.add(rp.permission.action)
    }
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
    permissions: Array.from(permissions)
  }
})
