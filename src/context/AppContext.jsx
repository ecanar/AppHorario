import { createContext, useContext, useReducer, useEffect } from 'react'

const INITIAL_STATE = {
  puestos: [
    { id: 'p1', nombre: 'Cocinero', descripcion: 'Preparación de alimentos' },
    { id: 'p2', nombre: 'Mesero', descripcion: 'Atención de mesas' },
    { id: 'p3', nombre: 'Cajero', descripcion: 'Manejo de caja' },
    { id: 'p4', nombre: 'Hostess', descripcion: 'Recepción de clientes' },
    { id: 'p5', nombre: 'Supervisor', descripcion: 'Supervisión general' },
  ],
  sucursales: [
    { id: 's1', nombre: 'Restaurante Centro', direccion: 'Calle Principal 100', color: '#3B82F6' },
    { id: 's2', nombre: 'Restaurante Norte', direccion: 'Av. Norte 250', color: '#10B981' },
    { id: 's3', nombre: 'Restaurante Sur', direccion: 'Blvd. Sur 380', color: '#F59E0B' },
  ],
  empleados: [
    { id: 'e1', nombre: 'Carlos', apellido: 'García', puestoId: 'p1', telefono: '555-1001', activo: true },
    { id: 'e2', nombre: 'María', apellido: 'López', puestoId: 'p2', telefono: '555-1002', activo: true },
    { id: 'e3', nombre: 'Luis', apellido: 'Martínez', puestoId: 'p3', telefono: '555-1003', activo: true },
    { id: 'e4', nombre: 'Ana', apellido: 'Rodríguez', puestoId: 'p2', telefono: '555-1004', activo: true },
    { id: 'e5', nombre: 'Pedro', apellido: 'Sánchez', puestoId: 'p1', telefono: '555-1005', activo: true },
    { id: 'e6', nombre: 'Laura', apellido: 'Hernández', puestoId: 'p4', telefono: '555-1006', activo: true },
    { id: 'e7', nombre: 'José', apellido: 'Pérez', puestoId: 'p5', telefono: '555-1007', activo: true },
    { id: 'e8', nombre: 'Carmen', apellido: 'Díaz', puestoId: 'p2', telefono: '555-1008', activo: true },
  ],
  asignaciones: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return action.payload
    case 'ADD_PUESTO': return { ...state, puestos: [...state.puestos, action.payload] }
    case 'UPDATE_PUESTO': return { ...state, puestos: state.puestos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PUESTO': return { ...state, puestos: state.puestos.filter(p => p.id !== action.payload) }
    case 'ADD_SUCURSAL': return { ...state, sucursales: [...state.sucursales, action.payload] }
    case 'UPDATE_SUCURSAL': return { ...state, sucursales: state.sucursales.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_SUCURSAL': return { ...state, sucursales: state.sucursales.filter(s => s.id !== action.payload), asignaciones: state.asignaciones.filter(a => a.sucursalId !== action.payload) }
    case 'ADD_EMPLEADO': return { ...state, empleados: [...state.empleados, action.payload] }
    case 'UPDATE_EMPLEADO': return { ...state, empleados: state.empleados.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EMPLEADO': return { ...state, empleados: state.empleados.filter(e => e.id !== action.payload), asignaciones: state.asignaciones.filter(a => a.empleadoId !== action.payload) }
    case 'SAVE_ASIGNACION': {
      const { id, empleadoId, fecha, sucursalId } = action.payload
      const existing = state.asignaciones.find(a => a.empleadoId === empleadoId && a.fecha === fecha)
      if (existing) {
        if (!sucursalId) return { ...state, asignaciones: state.asignaciones.filter(a => !(a.empleadoId === empleadoId && a.fecha === fecha)) }
        return { ...state, asignaciones: state.asignaciones.map(a => (a.empleadoId === empleadoId && a.fecha === fecha) ? { ...a, sucursalId } : a) }
      }
      if (!sucursalId) return state
      return { ...state, asignaciones: [...state.asignaciones, { id, empleadoId, sucursalId, fecha }] }
    }
    default: return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  useEffect(() => {
    const saved = localStorage.getItem('appHorario_v1')
    if (saved) {
      try { dispatch({ type: 'LOAD', payload: JSON.parse(saved) }) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('appHorario_v1', JSON.stringify(state))
  }, [state])

  const genId = () => `${Date.now()}${Math.random().toString(36).slice(2, 5)}`

  return (
    <AppContext.Provider value={{ state, dispatch, genId }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
