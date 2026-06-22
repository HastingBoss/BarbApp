import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

function AuthMiddleware() {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" />
  return <Outlet />
}

export default AuthMiddleware
