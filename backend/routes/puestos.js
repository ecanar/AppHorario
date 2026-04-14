const router = require('express').Router()
const { pool } = require('../db')

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM puestos ORDER BY nombre')
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  const { id, nombre, descripcion = '' } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO puestos (id, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *',
      [id, nombre, descripcion]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  const { nombre, descripcion = '' } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE puestos SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [nombre, descripcion, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM puestos WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
