// rotas de cada tela
import { Navigate, Route, Routes } from 'react-router-dom'
import { UsuarioProvider } from './usuario.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'

import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'

import VoosCliente from './pages/cliente/Voos.jsx'
import Assentos from './pages/cliente/Assentos.jsx'
import MinhasCompras from './pages/cliente/MinhasCompras.jsx'

import Aeronaves from './pages/gerente/Aeronaves.jsx'
import Trajetos from './pages/gerente/Trajetos.jsx'
import Tripulantes from './pages/gerente/Tripulantes.jsx'

import VoosAdmin from './pages/admin/Voos.jsx'
import NovoVoo from './pages/admin/NovoVoo.jsx'

export default function App() {
  return (
    <UsuarioProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/cliente" element={<RotaProtegida papel="cliente" />}>
          <Route path="voos" element={<VoosCliente />} />
          <Route path="voos/:numVoo" element={<Assentos />} />
          <Route path="compras" element={<MinhasCompras />} />
        </Route>

        <Route path="/gerente" element={<RotaProtegida papel="gerente" />}>
          <Route path="aeronaves" element={<Aeronaves />} />
          <Route path="trajetos" element={<Trajetos />} />
          <Route path="tripulantes" element={<Tripulantes />} />
        </Route>

        <Route path="/admin" element={<RotaProtegida papel="administrador" />}>
          <Route path="voos" element={<VoosAdmin />} />
          <Route path="voos/novo" element={<NovoVoo />} />
        </Route>

        {/* qualquer outra rota volta pro login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </UsuarioProvider>
  )
}
