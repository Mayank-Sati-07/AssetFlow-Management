const app = require('./app')

const port = Number(process.env.PORT || 3000)

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[assetflow-backend] listening on :${port}`)
})

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('unhandledRejection', err)
  server.close(() => process.exit(1))
})

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('uncaughtException', err)
  server.close(() => process.exit(1))
})
