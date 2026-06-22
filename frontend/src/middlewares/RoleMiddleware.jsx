import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

function RoleMiddleware({ allowedRoles }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" />
    if (user.role === "barbero") return <Navigate to="/barbero" />
    return <Navigate to="/cliente/reserva" />
  }
  return <Outlet />
}

export default RoleMiddleware
