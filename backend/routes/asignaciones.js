const router = require('express').Router()
const { pool } = require('../db')

const toClient = (row) => ({
  id: row.id,
  empleadoId: row.empleado_id,
  sucursalId: row.sucursal_id,
  fecha: row.fecha instanceof Date
    ? row.fecha.toISOString().split('T')[0]
    : String(row.fecha).split('T')[0],
})

router.get('/', async (req, res, next) => {
  try {
    const { fecha_start, fecha_end } = req.query
    let query = 'SELECT * FROM asignaciones'
    const params = []
    if (fecha_start && fecha_end) {
      query += ' WHERE fecha BETWEEN $1 AND $2'
      params.push(fecha_start, fecha_end)
    }
    query += ' ORDER BY fecha'
    const { rows } = await pool.query(query, params)
    res.json(rows.map(toClient))
  } catch (err) { next(err) }
})

router.post('/upsert', async (req, res, next) => {
  const { id, empleadoId, sucursalId, fecha } = req.body
  try {
    if (!sucursalId) {
      await pool.query(
        'DELETE FROM asignaciones WHERE empleado_id=$1 AND fecha=$2',
        [empleadoId, fecha]
      )
      return res.json({ deleted: true })
    }
    const { rows } = await pool.query(`
      INSERT INTO asignaciones (id, empleado_id, sucursal_id, fecha)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (empleado_id, fecha)
      DO UPDATE SET sucursal_id = EXCLUDED.sucursal_id, id = EXCLUDED.id
      RETURNING *
    `, [id, empleadoId, sucursalId, fecha])
    res.json(toClient(rows[0]))
  } catch (err) { next(err) }
})

router.delete('/:empleadoId/:fecha', async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM asignaciones WHERE empleado_id=$1 AND fecha=$2',
      [req.params.empleadoId, req.params.fecha]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
