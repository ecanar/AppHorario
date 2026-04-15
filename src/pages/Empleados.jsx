import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

const EMPTY = { nombre: '', apellido: '', alias: '', puestoId: '', telefono: '', activo: true }

export default function Empleados() {
  const { state, dispatch, genId } = useApp()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState('todos')

  const displayed = state.empleados.filter(e => {
    if (filter === 'activos') return e.activo
    if (filter === 'inactivos') return !e.activo
    return true
  })

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY, puestoId: state.puestos[0]?.id || '' } })
  const openEdit = (e) => setModal({ mode: 'edit', data: { ...e } })

  const save = () => {
    if (!modal.data.nombre.trim() || !modal.data.apellido.trim()) return
    dispatch({ type: modal.mode === 'add' ? 'ADD_EMPLEADO' : 'UPDATE_EMPLEADO', payload: modal.mode === 'add' ? { ...modal.data, id: genId() } : modal.data })
    setModal(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.empleados.filter(e => e.activo).length} activos · {state.empleados.length} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['todos', 'activos', 'inactivos'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay empleados en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Empleado</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Puesto</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Alias</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map(emp => {
                  const puesto = state.puestos.find(p => p.id === emp.puestoId)
                  const initials = `${emp.nombre[0] || ''}${emp.apellido[0] || ''}`.toUpperCase()
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{emp.nombre} {emp.apellido}</p>
                            <p className="text-xs text-gray-400 sm:hidden">{puesto?.nombre || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{puesto?.nombre || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{emp.alias || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{emp.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          emp.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Nuevo Empleado' : 'Editar Empleado'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={modal.data.nombre}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, nombre: e.target.value } }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  value={modal.data.apellido}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, apellido: e.target.value } }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
              <input
                type="text"
                value={modal.data.alias}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, alias: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juanito"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
              <select
                value={modal.data.puestoId}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, puestoId: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Sin puesto asignado</option>
                {state.puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={modal.data.telefono}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, telefono: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 555-1234"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={modal.data.activo}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, activo: e.target.checked } }))}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Empleado activo</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={!modal.data.nombre.trim() || !modal.data.apellido.trim()}
                className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Eliminar empleado" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-sm text-gray-600 mb-2">¿Deseas eliminar este empleado?</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5">Se eliminarán todas sus asignaciones.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => { dispatch({ type: 'DELETE_EMPLEADO', payload: deleteId }); setDeleteId(null) }}
              className="flex-1 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
