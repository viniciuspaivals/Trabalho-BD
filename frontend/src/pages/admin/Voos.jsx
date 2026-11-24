import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { admin } from '../../api.js'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const STATUS = ['Programado', 'Atrasado', 'Cancelado', 'Concluído']

const COR_STATUS = {
  Programado: 'bg-blue-100 text-blue-900 border-blue-200',
  Atrasado: 'bg-amber-100 text-amber-800 border-amber-200',
  Cancelado: 'bg-red-100 text-red-800 border-red-200',
  Concluído: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

export default function Voos() {
  const [voos, setVoos] = useState([])
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [mudando, setMudando] = useState(null) // voo que esta trocando de status
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    admin
      .listarVoos()
      .then(setVoos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  async function mudarStatus(voo, status) {
    if (status === 'Cancelado' && !window.confirm(`Cancelar o voo ${voo.numvoo}?`)) return
    setErro('')
    setSucesso('')
    setMudando(voo.numvoo)
    try {
      await admin.atualizarStatus(voo.numvoo, status)
      // so troca na lista pra nao buscar tudo de novo
      setVoos((atual) => atual.map((v) => (v.numvoo === voo.numvoo ? { ...v, status } : v)))
      setSucesso(`Voo ${voo.numvoo} agora está ${status.toLowerCase()}.`)
    } catch (e) {
      setErro(e.message)
    } finally {
      setMudando(null)
    }
  }

  const termo = busca.trim().toLowerCase()
  const lista = voos.filter((v) => {
    if (filtro !== 'Todos' && v.status !== filtro) return false
    if (!termo) return true
    return [v.numvoo, v.origem, v.destino, v.numaeronave].some((campo) => String(campo).toLowerCase().includes(termo))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Voos</h1>
          <p className="text-sm text-slate-500">Todos os voos com a tripulação escalada, inclusive os cancelados.</p>
        </div>
        <Link to="/admin/voos/novo" className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold">
          Novo voo
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {['Todos', ...STATUS].map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`px-3 py-1.5 border font-medium ${
              filtro === s ? 'bg-blue-800 border-blue-800 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s} ({s === 'Todos' ? voos.length : voos.filter((v) => v.status === s).length})
          </button>
        ))}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por voo, cidade ou aeronave"
          className="ml-auto w-full sm:w-72 px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
      </div>

      <Mensagem texto={erro} aoFechar={() => setErro('')} />
      <Mensagem tipo="sucesso" texto={sucesso} aoFechar={() => setSucesso('')} />

      {carregando ? (
        <Carregando texto="Buscando voos..." />
      ) : lista.length === 0 ? (
        !erro && <p className="text-center text-slate-500 py-8">Nenhum voo encontrado.</p>
      ) : (
        <div className="space-y-3">
          {lista.map((voo) => (
            <CartaoVoo key={voo.numvoo} voo={voo} mudando={mudando === voo.numvoo} aoMudarStatus={(s) => mudarStatus(voo, s)} />
          ))}
        </div>
      )}
    </div>
  )
}

function CartaoVoo({ voo, mudando, aoMudarStatus }) {
  const ocupados = voo.capacidadetotal - voo.assentosdisponiveis
  const piloto = voo.escala_tecnica.find((t) => t.funcao === 'Piloto')
  const copiloto = voo.escala_tecnica.find((t) => t.funcao === 'Copiloto')

  return (
    <div className={`bg-white border border-slate-200 ${voo.status === 'Cancelado' ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-blue-800 text-white text-xs font-mono font-bold px-2.5 py-1">{voo.numvoo}</span>
          <span className="font-semibold">
            {voo.origem} para {voo.destino}
          </span>
        </div>
        <select
          value={voo.status}
          disabled={mudando}
          onChange={(e) => aoMudarStatus(e.target.value)}
          className={`px-2 py-1 text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-60 ${COR_STATUS[voo.status]}`}
        >
          {STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 px-5 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Info titulo="Partida" texto={formatar.dataHora(voo.horarioprevistopartida)} detalhe={voo.aeroportoorigem} />
        <Info titulo="Chegada" texto={formatar.dataHora(voo.horarioprevistochegada)} detalhe={voo.aeroportodestino} />
        <Info titulo="Aeronave" texto={voo.numaeronave} detalhe={voo.modeloaeronave} />
        <Info
          titulo="Ocupação"
          texto={`${ocupados} de ${voo.capacidadetotal} assentos`}
          detalhe={`valor base ${formatar.dinheiro(voo.valorbase)}`}
        />
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-sm grid gap-2 sm:grid-cols-3">
        <Pessoa funcao="Piloto" nome={piloto?.nome} />
        <Pessoa funcao="Copiloto" nome={copiloto?.nome} />
        <Pessoa
          funcao={`Comissários (${voo.escala_comissarios.length})`}
          nome={voo.escala_comissarios.map((c) => c.nome).join(', ')}
        />
      </div>
    </div>
  )
}

function Info({ titulo, texto, detalhe }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500">{titulo}</div>
      <div className="font-semibold">{texto}</div>
      <div className="text-xs text-slate-500">{detalhe}</div>
    </div>
  )
}

function Pessoa({ funcao, nome }) {
  return (
    <div>
      <span className="text-xs font-semibold text-slate-500">{funcao}</span>
      <div className={nome ? '' : 'text-slate-400'}>{nome || 'ninguém escalado'}</div>
    </div>
  )
}
