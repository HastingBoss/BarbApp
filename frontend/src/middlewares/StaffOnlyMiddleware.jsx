import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

function StaffOnlyMiddleware() {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/staff" />
  if (user.role === "cliente") return <Navigate to="/" />

  return <Outlet />
}

export default StaffOnlyMiddleware
