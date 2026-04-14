const router = require('express').Router()
const { pool } = require('../db')

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sucursales ORDER BY nombre')
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  const { id, nombre, direccion = '', color = '#3B82F6' } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO sucursales (id, nombre, direccion, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, nombre, direccion, color]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  const { nombre, direccion = '', color = '#3B82F6' } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE sucursales SET nombre=$1, direccion=$2, color=$3 WHERE id=$4 RETURNING *',
      [nombre, direccion, color, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM asignaciones WHERE sucursal_id=$1', [req.params.id])
    await pool.query('DELETE FROM sucursales WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
