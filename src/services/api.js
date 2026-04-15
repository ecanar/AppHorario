const BASE = import.meta.env.VITE_API_URL ?? ''

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getPuestos:      ()       => req('/api/puestos'),
  createPuesto:    (data)   => req('/api/puestos', { method: 'POST', body: JSON.stringify(data) }),
  updatePuesto:    (id, d)  => req(`/api/puestos/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deletePuesto:    (id)     => req(`/api/puestos/${id}`, { method: 'DELETE' }),

  getSucursales:   ()       => req('/api/sucursales'),
  createSucursal:  (data)   => req('/api/sucursales', { method: 'POST', body: JSON.stringify(data) }),
  updateSucursal:  (id, d)  => req(`/api/sucursales/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteSucursal:  (id)     => req(`/api/sucursales/${id}`, { method: 'DELETE' }),

  getEmpleados:    ()       => req('/api/empleados'),
  createEmpleado:  (data)   => req('/api/empleados', { method: 'POST', body: JSON.stringify(data) }),
  updateEmpleado:  (id, d)  => req(`/api/empleados/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteEmpleado:  (id)     => req(`/api/empleados/${id}`, { method: 'DELETE' }),

  getAsignaciones: (s, e)   => req(`/api/asignaciones?fecha_start=${s}&fecha_end=${e}`),
  upsertAsignacion:(data)   => req('/api/asignaciones/upsert', { method: 'POST', body: JSON.stringify(data) }),
}
