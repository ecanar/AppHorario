const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS puestos (
      id VARCHAR(60) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS sucursales (
      id VARCHAR(60) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      direccion TEXT DEFAULT '',
      color VARCHAR(20) DEFAULT '#3B82F6'
    );

    CREATE TABLE IF NOT EXISTS empleados (
      id VARCHAR(60) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      puesto_id VARCHAR(60),
      telefono VARCHAR(50) DEFAULT '',
      activo BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS asignaciones (
      id VARCHAR(60) PRIMARY KEY,
      empleado_id VARCHAR(60) NOT NULL,
      sucursal_id VARCHAR(60) NOT NULL,
      fecha DATE NOT NULL,
      UNIQUE(empleado_id, fecha)
    );
  `)
  console.log('Database initialized')
}

module.exports = { pool, initDB }
