import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react'

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#14B8A6']
const EMPTY = { nombre: '', direccion: '', color: '#3B82F6' }

export default function Sucursales() {
  const { state, dispatch, genId } = useApp()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const save = () => {
    if (!modal.data.nombre.trim()) return
    dispatch({ type: modal.mode === 'add' ? 'ADD_SUCURSAL' : 'UPDATE_SUCURSAL', payload: modal.mode === 'add' ? { ...modal.data, id: genId() } : modal.data })
    setModal(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-sm text-gray-500 mt-1">{state.sucursales.length} sucursales registradas</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add', data: { ...EMPTY } })}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Sucursal
        </button>
      </div>

      {state.sucursales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay sucursales registradas</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.sucursales.map(s => {
            const asigCount = state.asignaciones.filter(a => a.sucursalId === s.id).length
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                <div className="h-2" style={{ backgroundColor: s.color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '20' }}>
                        <Building2 className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{s.nombre}</p>
                        {s.direccion && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <p className="text-xs text-gray-500 truncate">{s.direccion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setModal({ mode: 'edit', data: { ...s } })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{asigCount} asignaciones totales</span>
                    <span className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: s.color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Nueva Sucursal' : 'Editar Sucursal'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={modal.data.nombre}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, nombre: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Restaurante Centro"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={modal.data.direccion}
                onChange={e => setModal(m => ({ ...m, data: { ...m.data, direccion: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Calle Principal 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color identificador</label>
              <div className="flex gap-2 flex-wrap">
                {PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => setModal(m => ({ ...m, data: { ...m.data, color: c } }))}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${modal.data.color === c ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: modal.data.color }} />
                Color seleccionado: <code className="font-mono">{modal.data.color}</code>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={!modal.data.nombre.trim()}
                className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Eliminar sucursal" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-sm text-gray-600 mb-2">¿Deseas eliminar esta sucursal?</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5">Se eliminarán todas las asignaciones asociadas.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => { dispatch({ type: 'DELETE_SUCURSAL', payload: deleteId }); setDeleteId(null) }}
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
