import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = 8080
const ELEVENTY_PORT = 8081
const WORKER_PORT = 8787
const WORKER_ENTRY = './workers/dynamic-pages/index.js'

const startProcess = (command, args, name) => {
  console.log(`Starting ${name}...`)
  const process = spawn(command, args, { stdio: 'inherit' })

  process.on('error', err => {
    console.error(`${name} error: ${err.message}`)
    process.exit(1)
  })

  process.on('exit', code => {
    console.log(`${name} exited with code ${code}`)
    if (code !== 0) process.exit(code)
  })

  return process
}

const startEleventy = () =>
  startProcess('npx', ['eleventy', '--serve', '--port', ELEVENTY_PORT], 'Eleventy')

const startWorker = () =>
  startProcess('npx', ['wrangler', 'dev', WORKER_ENTRY, '--port', WORKER_PORT], 'Wrangler Worker')

const app = express()

app.use((req, res, next) => {
  if (req.path === '/js/script.js') {
    res.setHeader('Content-Type', 'application/javascript')
    return res.send('')
  }
  if (req.path.endsWith('.css')) res.setHeader('Content-Type', 'text/css')
  else if (req.path.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript')
  else if (req.path.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
  else if (req.path.startsWith('/api/')) res.setHeader('Content-Type', 'application/json')
  else if (req.path.startsWith('/feeds/all')) res.setHeader('Content-Type', 'application/xml')
  else if (req.path.startsWith('/feeds/books')) res.setHeader('Content-Type', 'application/xml')
  else if (req.path.startsWith('/feeds/links')) res.setHeader('Content-Type', 'application/xml')
  else if (req.path.startsWith('/feeds/movies')) res.setHeader('Content-Type', 'application/xml')
  else if (req.path.startsWith('/feeds/posts')) res.setHeader('Content-Type', 'application/xml')
  else if (req.path.startsWith('/feeds/syndication')) res.setHeader('Content-Type', 'application/xml')
  next()
})

app.use(express.static(path.join(__dirname, '_site'), { extensions: ['html'] }))

const proxy = createProxyMiddleware({
  target: `http://localhost:${WORKER_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: (path, req) => req.originalUrl,
  onError: (err, req, res) => {
    console.error(`Proxy error: ${err.message}`)
    res.status(504).send('Worker timeout or unreachable')
  },
})

app.use(
  ['/watching/movies', '/watching/shows', '/music/artists', '/music/genres', '/books'],
  proxy
)

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '_site', '404.html'), err => {
    if (err) res.status(404).send('Page not found')
  })
})

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })

  const shutdown = () => {
    console.log('Shutting down...')
    server.close(() => {
      console.log('Express server closed')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

const initialize = async () => {
  try {
    startEleventy()
    startWorker()
    startServer()
  } catch (err) {
    console.error(`Initialization error: ${err.message}`)
    process.exit(1)
  }
}

initialize()