import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Empleados from './pages/Empleados'
import Sucursales from './pages/Sucursales'
import Puestos from './pages/Puestos'
import Asignaciones from './pages/Asignaciones'
import Calendario from './pages/Calendario'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="sucursales" element={<Sucursales />} />
            <Route path="puestos" element={<Puestos />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="calendario" element={<Calendario />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
