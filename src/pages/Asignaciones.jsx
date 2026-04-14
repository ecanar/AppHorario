import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { ChevronLeft, ChevronRight, CalendarRange, RotateCcw } from 'lucide-react'

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

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Asignaciones() {
  const { state, dispatch, genId } = useApp()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [modal, setModal] = useState(null)

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const today = dateStr(new Date())

  const empleadosActivos = state.empleados.filter(e => e.activo)

  const getAsig = (empleadoId, fecha) =>
    state.asignaciones.find(a => a.empleadoId === empleadoId && a.fecha === fecha)

  const openModal = (emp, date) => {
    const fecha = dateStr(date)
    const asig = getAsig(emp.id, fecha)
    setModal({ emp, fecha, selectedId: asig?.sucursalId || '' })
  }

  const save = () => {
    dispatch({
      type: 'SAVE_ASIGNACION',
      payload: { id: genId(), empleadoId: modal.emp.id, fecha: modal.fecha, sucursalId: modal.selectedId || null },
    })
    setModal(null)
  }

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6)
    const fmt = { day: '2-digit', month: 'short' }
    return `${weekStart.toLocaleDateString('es-ES', fmt)} – ${end.toLocaleDateString('es-ES', fmt)} ${weekStart.getFullYear()}`
  }, [weekStart])

  const goToday = () => setWeekStart(getWeekStart(new Date()))
  const isCurrentWeek = dateStr(weekStart) === dateStr(getWeekStart(new Date()))

  const totalSemana = state.asignaciones.filter(a => weekDays.some(d => dateStr(d) === a.fecha)).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalSemana} asignaciones esta semana
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button
              onClick={goToday}
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

      {empleadosActivos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
          <CalendarRange className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay empleados activos para asignar</p>
          <p className="text-xs mt-1">Agrega empleados en la sección Empleados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '720px' }}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 sticky left-0 bg-gray-50 z-10 w-44 border-r border-gray-200">
                    Empleado
                  </th>
                  {weekDays.map((d, i) => {
                    const str = dateStr(d)
                    const isT = str === today
                    return (
                      <th key={str} className={`text-center px-1 py-2 w-[calc((100%-176px)/7)] ${isT ? 'text-blue-600' : 'text-gray-500'}`}>
                        <div className="text-xs font-medium uppercase tracking-wide">{DAYS[i]}</div>
                        <div className={`text-lg font-bold leading-tight ${isT ? 'text-blue-600' : 'text-gray-700'}`}>{d.getDate()}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empleadosActivos.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 sticky left-0 bg-white z-10 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-[11px] font-bold shrink-0">
                          {emp.nombre[0]}{emp.apellido[0]}
                        </div>
                        <span className="text-xs font-medium text-gray-800 truncate">
                          {emp.nombre} {emp.apellido}
                        </span>
                      </div>
                    </td>
                    {weekDays.map(d => {
                      const fecha = dateStr(d)
                      const asig = getAsig(emp.id, fecha)
                      const suc = asig ? state.sucursales.find(s => s.id === asig.sucursalId) : null
                      const isT = fecha === today
                      return (
                        <td key={fecha} className={`px-1 py-1.5 ${isT ? 'bg-blue-50/30' : ''}`}>
                          <button
                            onClick={() => openModal(emp, d)}
                            className="w-full min-h-[38px] rounded-lg text-xs font-medium transition-all flex items-center justify-center px-1"
                            style={suc
                              ? { backgroundColor: suc.color + '18', border: `1.5px solid ${suc.color}60`, color: suc.color }
                              : { border: '1.5px dashed #E5E7EB', color: '#D1D5DB' }
                            }
                          >
                            {suc ? (
                              <span className="text-center leading-tight">
                                {suc.nombre.replace('Restaurante ', '')}
                              </span>
                            ) : (
                              <span className="text-lg leading-none">+</span>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-4 flex-wrap">
            <span className="text-xs text-gray-400">Leyenda:</span>
            {state.sucursales.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.nombre}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm border border-dashed border-gray-300" />
              Sin asignar
            </div>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Asignar Sucursal" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
              <p className="text-xs text-gray-500">Empleado</p>
              <p className="text-sm font-semibold text-gray-900">{modal.emp.nombre} {modal.emp.apellido}</p>
              <p className="text-xs text-gray-500 capitalize">
                {new Date(modal.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sucursal</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="radio"
                    name="suc"
                    value=""
                    checked={modal.selectedId === ''}
                    onChange={() => setModal(m => ({ ...m, selectedId: '' }))}
                    className="w-4 h-4 accent-gray-500"
                  />
                  <span className="text-sm text-gray-500">Sin asignar (descanso)</span>
                </label>
                {state.sucursales.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                    <input
                      type="radio"
                      name="suc"
                      value={s.id}
                      checked={modal.selectedId === s.id}
                      onChange={() => setModal(m => ({ ...m, selectedId: s.id }))}
                      className="w-4 h-4"
                      style={{ accentColor: s.color }}
                    />
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-gray-800">{s.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={save} className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
