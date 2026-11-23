import { Navigate, Outlet } from 'react-router-dom'
import { useUsuario, INICIO_POR_PAPEL } from '../usuario.jsx'
import Navbar from './Navbar.jsx'

// so deixa entrar quem logou com o papel certo e ja coloca a navbar
export default function RotaProtegida({ papel }) {
  const { usuario } = useUsuario()

  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.papel !== papel) return <Navigate to={INICIO_POR_PAPEL[usuario.papel] || '/login'} replace />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
