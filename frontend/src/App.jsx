import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthContextProvider } from "./context/AuthContext"
import AlreadyAuthMiddleware from "./middlewares/AlreadyAuthMiddleware"
import RoleMiddleware from "./middlewares/RoleMiddleware"
import StaffOnlyMiddleware from "./middlewares/StaffOnlyMiddleware"
import Layout from "./components/Layout/Layout"
import AdminLayout from "./pages/admin/AdminLayout"
import BarberoLayout from "./pages/barbero/BarberoLayout"

// Pages
import Login from "./pages/Login/Login"
import Register from "./pages/Register/Register"
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail"
import LandingCliente from "./pages/LandingCliente/LandingCliente"
import StaffLogin from "./pages/StaffLogin/StaffLogin"
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard"
import AdminBarberos from "./pages/admin/AdminBarberos/AdminBarberos"
import AdminServicios from "./pages/admin/AdminServicios/AdminServicios"
import AdminTurnos from "./pages/admin/AdminTurnos/AdminTurnos"
import BarberoAgenda from "./pages/barbero/BarberoAgenda/BarberoAgenda"
import ClienteReserva from "./pages/cliente/ClienteReserva/ClienteReserva"
import ClienteHistorial from "./pages/cliente/ClienteHistorial/ClienteHistorial"

const App = () => {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>

          {/* Rutas públicas de clientes — redirigen al dashboard/reserva si ya estás logueado */}
          <Route element={<AlreadyAuthMiddleware />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Rutas públicas sin restricción */}
          <Route path="/" element={<LandingCliente />} />
          <Route path="/reservar" element={<Layout><ClienteReserva /></Layout>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Rutas de staff (públicas del equipo) */}
          <Route path="/staff" element={<StaffLogin />} />

          {/* Rutas de admin protegidas */}
          <Route element={<StaffOnlyMiddleware />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/barberos" element={<AdminBarberos />} />
              <Route path="/admin/servicios" element={<AdminServicios />} />
              <Route path="/admin/turnos" element={<AdminTurnos />} />
            </Route>
          </Route>

          {/* Rutas de barbero protegidas */}
          <Route element={<StaffOnlyMiddleware />}>
            <Route element={<BarberoLayout />}>
              <Route path="/barbero" element={<BarberoAgenda />} />
            </Route>
          </Route>

          {/* Rutas de cliente autenticado */}
          <Route element={<RoleMiddleware allowedRoles={["cliente"]} />}>
            <Route element={<Layout />}>
              <Route path="/cliente/historial" element={<ClienteHistorial />} />
              <Route path="/cliente/reserva" element={<ClienteReserva />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
