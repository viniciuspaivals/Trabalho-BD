import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../api.js'
import { useUsuario, INICIO_POR_PAPEL } from '../usuario.jsx'
import Mensagem from '../components/Mensagem.jsx'

// tripulante nao tem tela no sistema
const PAPEIS_COM_TELA = ['cliente', 'gerente', 'administrador']
const NOME_PAPEL = { cliente: 'Cliente', gerente: 'Gerente', administrador: 'Administrador' }

// atalhos com usuarios do povoamento pra apresentacao
const ATALHOS = [
  { rotulo: 'Cliente', nome: 'João Silva', id: '11111111111' },
  { rotulo: 'Gerente', nome: 'Carlos Gerente', id: '33333333333' },
  { rotulo: 'Administrador', nome: 'Ana Admin', id: '44444444444' },
]

export default function Login() {
  const { usuario, entrar } = useUsuario()
  const navigate = useNavigate()
  const [identificador, setIdentificador] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [escolha, setEscolha] = useState(null) // quando a pessoa tem mais de um perfil

  if (usuario) return <Navigate to={INICIO_POR_PAPEL[usuario.papel]} replace />

  function entrarComo(dados, papel) {
    entrar({ ...dados, papel })
    navigate(INICIO_POR_PAPEL[papel])
  }

  async function fazerLogin(valor) {
    const id = (valor ?? identificador).trim()
    if (!id) return setErro('Informe seu CPF, e-mail ou nº de credencial.')
    setErro('')
    setCarregando(true)
    try {
      const dados = await auth.login(id)
      const papeis = dados.papeis.filter((p) => PAPEIS_COM_TELA.includes(p))
      if (papeis.length === 0) {
        setErro('Este usuário não tem acesso ao sistema (tripulantes não usam as telas).')
      } else if (papeis.length === 1) {
        entrarComo(dados, papeis[0])
      } else {
        setEscolha({ dados, papeis })
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center text-white space-y-2">
          <img src="/aviao.svg" alt="" className="w-14 h-14 mx-auto" />
          <h1 className="text-3xl font-extrabold">Decolaê</h1>
          <p className="text-sky-200 text-sm">Sistema de gestão de voos e passagens</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {escolha ? (
            <div className="space-y-3">
              <p className="text-sm">Olá, <strong>{escolha.dados.nome}</strong>. Entrar como:</p>
              {escolha.papeis.map((p) => (
                <button
                  key={p}
                  onClick={() => entrarComo(escolha.dados, p)}
                  className="w-full py-2.5 rounded-xl border-2 border-sky-600 text-sky-700 font-semibold hover:bg-sky-50"
                >
                  {NOME_PAPEL[p]}
                </button>
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                fazerLogin()
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-sm font-medium">CPF, e-mail ou nº de credencial</span>
                <input
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="Ex.: 11111111111"
                  autoFocus
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <Mensagem texto={erro} />
              <button
                disabled={carregando}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold"
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Ainda não tem conta?{' '}
                <Link to="/cadastro" className="text-sky-700 font-semibold hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </form>
          )}
        </div>

        {!escolha && (
          <div className="bg-white/10 rounded-2xl p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-sky-200 font-semibold mb-2">Acesso rápido (dados de teste)</p>
            <div className="grid grid-cols-3 gap-2">
              {ATALHOS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => fazerLogin(a.id)}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-2 py-2 text-left"
                >
                  <div className="text-sm font-semibold">{a.rotulo}</div>
                  <div className="text-xs text-slate-300 truncate">{a.nome}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
