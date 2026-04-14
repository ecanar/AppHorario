const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { initDB } = require('./db')

const app = express()

app.use(cors({
  origin: [
    'https://ecanar.github.io',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}))

app.use(express.json())

app.use('/api/puestos', require('./routes/puestos'))
app.use('/api/sucursales', require('./routes/sucursales'))
app.use('/api/empleados', require('./routes/empleados'))
app.use('/api/asignaciones', require('./routes/asignaciones'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  initDB().catch((err) => console.error('DB init error:', err))
})
