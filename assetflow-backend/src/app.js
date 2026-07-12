require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const ApiError = require('./utils/ApiError')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./modules/auth/routes')
const assetsRoutes = require('./modules/assets/routes')
const allocationsRoutes = require('./modules/allocations/routes')
const bookingsRoutes = require('./modules/bookings/routes')
const maintenanceRoutes = require('./modules/maintenance/routes')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use('/api/auth', authRoutes)
app.use('/api/assets', assetsRoutes)
app.use('/api/allocations', allocationsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/maintenance', maintenanceRoutes)

app.use((_req, _res, next) => {
  next(ApiError.notFound('Route not found'))
})

app.use(errorHandler)

module.exports = app
