import { Outlet } from "react-router-dom"
import BarberoNav from "../../components/BarberoNav/BarberoNav"
import "./BarberoLayout.css"

function BarberoLayout() {
  return (
    <div className="barbero-layout">
      <BarberoNav />
      <main className="barbero-content">
        <Outlet />
      </main>
    </div>
  )
}

export default BarberoLayout
