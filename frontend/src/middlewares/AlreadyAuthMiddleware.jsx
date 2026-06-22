import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

function AlreadyAuthMiddleware() {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div>Cargando...</div>
  if (!user) return <Outlet />
  // Redirigir según rol
  if (user.role === "admin") return <Navigate to="/admin" />
  if (user.role === "barbero") return <Navigate to="/barbero" />
  return <Navigate to="/reservar" />
}

export default AlreadyAuthMiddleware
