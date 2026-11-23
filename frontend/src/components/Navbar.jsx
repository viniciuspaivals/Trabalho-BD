import { NavLink, useNavigate } from 'react-router-dom'
import { useUsuario } from '../usuario.jsx'

// links do menu de cada perfil
const MENU = {
  cliente: [
    { para: '/cliente/voos', texto: 'Buscar voos' },
    { para: '/cliente/compras', texto: 'Minhas compras' },
  ],
  gerente: [
    { para: '/gerente/aeronaves', texto: 'Aeronaves' },
    { para: '/gerente/trajetos', texto: 'Trajetos' },
    { para: '/gerente/tripulantes', texto: 'Tripulantes' },
  ],
  administrador: [
    { para: '/admin/voos', texto: 'Voos' },
    { para: '/admin/voos/novo', texto: 'Novo voo' },
  ],
}

const NOME_PAPEL = { cliente: 'Cliente', gerente: 'Gerente', administrador: 'Administrador' }

export default function Navbar() {
  const { usuario, sair } = useUsuario()
  const navigate = useNavigate()

  function deslogar() {
    sair()
    navigate('/login')
  }

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <img src="/aviao.svg" alt="" className="w-7 h-7" />
          Decolaê
        </div>

        <nav className="order-last w-full sm:order-none sm:w-auto sm:flex-1 flex flex-wrap gap-1">
          {(MENU[usuario.papel] || []).map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <div className="text-right leading-tight">
            <div className="font-semibold">{usuario.nome}</div>
            <div className="text-xs text-sky-300">{NOME_PAPEL[usuario.papel]}</div>
          </div>
          <button
            onClick={deslogar}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
