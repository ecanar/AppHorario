import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const EMPTY_STATE = {
  puestos: [],
  sucursales: [],
  empleados: [],
  asignaciones: [],
  loading: true,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':         return { ...state, ...action.payload, loading: false, error: null }
    case 'SET_LOADING':  return { ...state, loading: action.payload }
    case 'SET_ERROR':    return { ...state, error: action.payload, loading: false }
    case 'ADD_PUESTO':   return { ...state, puestos: [...state.puestos, action.payload] }
    case 'UPDATE_PUESTO':return { ...state, puestos: state.puestos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PUESTO':return { ...state, puestos: state.puestos.filter(p => p.id !== action.payload) }
    case 'ADD_SUCURSAL': return { ...state, sucursales: [...state.sucursales, action.payload] }
    case 'UPDATE_SUCURSAL': return { ...state, sucursales: state.sucursales.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_SUCURSAL': return { ...state, sucursales: state.sucursales.filter(s => s.id !== action.payload), asignaciones: state.asignaciones.filter(a => a.sucursalId !== action.payload) }
    case 'ADD_EMPLEADO': return { ...state, empleados: [...state.empleados, action.payload] }
    case 'UPDATE_EMPLEADO': return { ...state, empleados: state.empleados.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EMPLEADO': return { ...state, empleados: state.empleados.filter(e => e.id !== action.payload), asignaciones: state.asignaciones.filter(a => a.empleadoId !== action.payload) }
    case 'LOAD_ASIGNACIONES': return { ...state, asignaciones: action.payload }
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
  const [state, localDispatch] = useReducer(reducer, EMPTY_STATE)

  useEffect(() => {
    Promise.all([api.getPuestos(), api.getSucursales(), api.getEmpleados()])
      .then(([puestos, sucursales, empleados]) => {
        localDispatch({ type: 'LOAD', payload: { puestos, sucursales, empleados } })
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        localDispatch({ type: 'SET_ERROR', payload: 'No se pudo conectar al servidor.' })
      })
  }, [])

  const loadAsignaciones = useCallback(async (start, end) => {
    try {
      const asignaciones = await api.getAsignaciones(start, end)
      localDispatch({ type: 'LOAD_ASIGNACIONES', payload: asignaciones })
    } catch (err) {
      console.error('Error loading asignaciones:', err)
    }
  }, [])

  const dispatch = useCallback(async (action) => {
    localDispatch(action)
    try {
      switch (action.type) {
        case 'ADD_PUESTO':      await api.createPuesto(action.payload); break
        case 'UPDATE_PUESTO':   await api.updatePuesto(action.payload.id, action.payload); break
        case 'DELETE_PUESTO':   await api.deletePuesto(action.payload); break
        case 'ADD_SUCURSAL':    await api.createSucursal(action.payload); break
        case 'UPDATE_SUCURSAL': await api.updateSucursal(action.payload.id, action.payload); break
        case 'DELETE_SUCURSAL': await api.deleteSucursal(action.payload); break
        case 'ADD_EMPLEADO':    await api.createEmpleado(action.payload); break
        case 'UPDATE_EMPLEADO': await api.updateEmpleado(action.payload.id, action.payload); break
        case 'DELETE_EMPLEADO': await api.deleteEmpleado(action.payload); break
        case 'SAVE_ASIGNACION': await api.upsertAsignacion(action.payload); break
      }
    } catch (err) {
      console.error('API sync error:', err)
    }
  }, [])

  const genId = () => `${Date.now()}${Math.random().toString(36).slice(2, 5)}`

  return (
    <AppContext.Provider value={{ state, dispatch, genId, loadAsignaciones }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
