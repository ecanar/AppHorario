import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react'

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function dateStr(d) {
  return d.toISOString().split('T')[0]
}

const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Calendario() {
  const { state } = useApp()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [sucursalId, setSucursalId] = useState(state.sucursales[0]?.id || '')
  const [view, setView] = useState('week')

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const today = dateStr(new Date())

  const sucursal = state.sucursales.find(s => s.id === sucursalId)

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6)
    const fmt = { day: '2-digit', month: 'short' }
    return `${weekStart.toLocaleDateString('es-ES', fmt)} – ${end.toLocaleDateString('es-ES', fmt)} ${weekStart.getFullYear()}`
  }, [weekStart])

  const isCurrentWeek = dateStr(weekStart) === dateStr(getWeekStart(new Date()))

  const getEmpleadosDia = (date) => {
    const fecha = dateStr(date)
    return state.asignaciones
      .filter(a => a.fecha === fecha && a.sucursalId === sucursalId)
      .map(a => ({
        asig: a,
        emp: state.empleados.find(e => e.id === a.empleadoId),
      }))
      .filter(x => x.emp)
  }

  const totalSemana = weekDays.reduce((acc, d) => acc + getEmpleadosDia(d).length, 0)

  if (state.sucursales.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario</h1>
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay sucursales configuradas</p>
          <p className="text-xs mt-1">Agrega sucursales primero</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-sm text-gray-500 mt-1">Vista de asignaciones por sucursal</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {state.sucursales.map(s => (
            <button
              key={s.id}
              onClick={() => setSucursalId(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                sucursalId === s.id
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
              style={sucursalId === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Hoy
            </button>
          )}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <button onClick={() => setWeekStart(getWeekStart(addDays(weekStart, -7)))} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 w-52 text-center select-none">{weekLabel}</span>
            <button onClick={() => setWeekStart(getWeekStart(addDays(weekStart, 7)))} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {sucursal && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: sucursal.color + '15', color: sucursal.color }}>
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sucursal.color }} />
          <span>{sucursal.nombre}</span>
          {sucursal.direccion && <span className="text-xs opacity-70">· {sucursal.direccion}</span>}
          <span className="ml-auto text-xs opacity-70 font-normal">{totalSemana} empleados esta semana</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((d, i) => {
          const fecha = dateStr(d)
          const empleados = getEmpleadosDia(d)

          return (
            <div
              key={fecha}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col transition-shadow hover:shadow-sm"
            >
              <div
                className="px-3 py-2.5 shrink-0"
                style={{ borderBottom: `3px solid ${sucursal?.color || '#3B82F6'}20`, backgroundColor: '#F9FAFB' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <span className="hidden lg:block">{DAYS_FULL[i]}</span>
                  <span className="lg:hidden">{DAYS_SHORT[i]}</span>
                </p>
                <p className="text-2xl font-bold leading-tight text-gray-800">
                  {d.getDate()}
                  <span className="text-sm font-normal ml-1 text-gray-400">
                    {d.toLocaleDateString('es-ES', { month: 'short' })}
                  </span>
                </p>
              </div>

              <div className="p-2 flex-1 min-h-[90px]">
                {empleados.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-300 text-center">Sin personal</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {empleados.map(({ emp }) => {
                      const puesto = state.puestos.find(p => p.id === emp.puestoId)
                      return (
                        <div
                          key={emp.id}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                          style={{ backgroundColor: (sucursal?.color || '#3B82F6') + '12' }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: sucursal?.color || '#3B82F6' }}
                          >
                            {emp.nombre[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {emp.nombre} {emp.apellido[0]}.
                            </p>
                            {puesto && (
                              <p className="text-[10px] text-gray-400 truncate">{puesto.nombre}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {empleados.length > 0 && (
                <div
                  className="px-3 py-1.5 border-t text-[10px] font-medium text-center"
                  style={{ borderColor: (sucursal?.color || '#3B82F6') + '30', color: sucursal?.color || '#3B82F6' }}
                >
                  {empleados.length} empleado{empleados.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
