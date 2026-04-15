const router = require('express').Router()
const { pool } = require('../db')

const toClient = (row) => ({
  id: row.id,
  nombre: row.nombre,
  apellido: row.apellido,
  puestoId: row.puesto_id,
  telefono: row.telefono,
  alias: row.alias,
  activo: row.activo,
})

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY apellido, nombre')
    res.json(rows.map(toClient))
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  const { id, nombre, apellido, puestoId = null, telefono = '', alias = '', activo = true } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO empleados (id, nombre, apellido, puesto_id, telefono, alias, activo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, nombre, apellido, puestoId || null, telefono, alias, activo]
    )
    res.json(toClient(rows[0]))
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  const { nombre, apellido, puestoId = null, telefono = '', alias = '', activo = true } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE empleados SET nombre=$1, apellido=$2, puesto_id=$3, telefono=$4, alias=$5, activo=$6 WHERE id=$7 RETURNING *',
      [nombre, apellido, puestoId || null, telefono, alias, activo, req.params.id]
    )
    res.json(toClient(rows[0]))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM asignaciones WHERE empleado_id=$1', [req.params.id])
    await pool.query('DELETE FROM empleados WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
