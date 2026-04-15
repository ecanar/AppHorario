const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const { initDB } = require('./db')

const app = express()

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps, curl, etc)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://horario.up.railway.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/puestos', require('./routes/puestos'))
app.use('/api/sucursales', require('./routes/sucursales'))
app.use('/api/empleados', require('./routes/empleados'))
app.use('/api/asignaciones', require('./routes/asignaciones'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Servir frontend compilado
const fs = require('fs')
const distPath = [
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, '../dist'),
  '/app/dist',
  '/opt/app/dist',
  path.join('/app', 'dist'),
].find(p => {
  const testPath = path.join(p, 'index.html')
  const exists = fs.existsSync(testPath)
  if (exists) console.log('distPath encontrado:', p)
  return exists
})

console.log('Buscando distPath en:', [
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, '../dist'),
  '/app/dist',
  '/opt/app/dist',
  path.join('/app', 'dist'),
])

if (distPath) {
  console.log('Sirviendo frontend desde:', distPath)
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  console.error('ERROR: No se encontró dist/index.html en ninguna ubicación')
  console.error('Directorio actual:', process.cwd())
  console.error('__dirname:', __dirname)
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  initDB().catch((err) => console.error('DB init error:', err))
})
