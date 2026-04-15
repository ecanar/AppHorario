import { useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Users, Building2, Briefcase, CalendarCheck, TrendingUp } from 'lucide-react'

function getWeekDates() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function Dashboard() {
  const { state, loadAsignaciones } = useApp()
  const { empleados, sucursales, puestos, asignaciones } = state

  const weekDates = useMemo(() => getWeekDates(), [])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (weekDates.length) {
      loadAsignaciones(weekDates[0], weekDates[weekDates.length - 1])
    }
  }, [weekDates, loadAsignaciones])

  const empleadosActivos = empleados.filter(e => e.activo).length
  const asignSemana = asignaciones.filter(a => weekDates.includes(a.fecha)).length
  const asignHoy = asignaciones.filter(a => a.fecha === today)

  const stats = [
    { label: 'Empleados activos', value: empleadosActivos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sucursales', value: sucursales.length, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Puestos de trabajo', value: puestos.length, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Asignaciones esta semana', value: asignSemana, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const sucursalesResumen = sucursales.map(s => ({
    ...s,
    count: asignaciones.filter(a => weekDates.includes(a.fecha) && a.sucursalId === s.id).length,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Asignaciones de hoy</h2>
          </div>
          {asignHoy.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin asignaciones para hoy</p>
          ) : (
            <div className="space-y-2">
              {asignHoy.map(a => {
                const emp = empleados.find(e => e.id === a.empleadoId)
                const suc = sucursales.find(s => s.id === a.sucursalId)
                if (!emp || !suc) return null
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {emp.nombre[0]}{emp.apellido[0]}
                      </div>
                      <span className="text-sm text-gray-700">{emp.nombre} {emp.apellido}</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full text-white" style={{ backgroundColor: suc.color }}>
                      {suc.nombre.replace('Restaurante ', '')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Asignaciones por sucursal (semana)</h2>
          {sucursalesResumen.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin sucursales</p>
          ) : (
            <div className="space-y-3">
              {sucursalesResumen.map(s => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm text-gray-700">{s.nombre}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: asignSemana > 0 ? `${(s.count / asignSemana) * 100}%` : '0%', backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
