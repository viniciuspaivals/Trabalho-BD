// tela de busca de voos do cliente que serve de modelo pras outras
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cliente } from '../../api.js'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FILTROS_VAZIOS = { origem: '', destino: '', data_voo: '' }

export default function Voos() {
  const navigate = useNavigate()
  const [voos, setVoos] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function buscar(f = filtros) {
    setCarregando(true)
    setErro('')
    try {
      setVoos(await cliente.listarVoos(f))
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  // busca todos os voos quando a tela abre
  useEffect(() => {
    buscar(FILTROS_VAZIOS)
  }, [])

  function alterarFiltro(campo, valor) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }))
  }

  function limpar() {
    setFiltros(FILTROS_VAZIOS)
    buscar(FILTROS_VAZIOS)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buscar voos</h1>
        <p className="text-sm text-slate-500">Voos disponíveis para compra (voos cancelados ou lotados não aparecem).</p>
      </div>

      {/* filtros */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          buscar()
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid gap-3 sm:grid-cols-4 items-end"
      >
        <Campo rotulo="Origem" valor={filtros.origem} aoMudar={(v) => alterarFiltro('origem', v)} placeholder="Ex.: Belo Horizonte" />
        <Campo rotulo="Destino" valor={filtros.destino} aoMudar={(v) => alterarFiltro('destino', v)} placeholder="Ex.: São Paulo" />
        <Campo rotulo="Data" tipo="date" valor={filtros.data_voo} aoMudar={(v) => alterarFiltro('data_voo', v)} />
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold">Buscar</button>
          <button type="button" onClick={limpar} className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
            Limpar
          </button>
        </div>
      </form>

      <Mensagem texto={erro} />

      {/* resultados */}
      {carregando ? (
        <Carregando texto="Buscando voos..." />
      ) : voos.length === 0 ? (
        !erro && <p className="text-center text-slate-500 py-8">Nenhum voo encontrado para essa busca.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{voos.length} voo(s) encontrado(s)</p>
          {voos.map((voo) => (
            <CartaoVoo key={voo.numvoo} voo={voo} aoEscolher={() => navigate(`/cliente/voos/${voo.numvoo}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Campo({ rotulo, valor, aoMudar, tipo = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  )
}

function CartaoVoo({ voo, aoEscolher }) {
  const poucosLugares = voo.assentosdisponiveis <= 5
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-5">
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-sky-600 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md">{voo.numvoo}</span>
          <span className="text-sm text-slate-500">
            {formatar.data(voo.horarioprevistopartida)} · {voo.modeloaeronave} ({voo.numaeronave})
          </span>
          {voo.status !== 'Programado' && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{voo.status}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-extrabold">{formatar.hora(voo.horarioprevistopartida)}</div>
            <div className="text-sm font-medium">{voo.origem}</div>
            <div className="text-xs text-slate-500">{voo.aeroportoorigem}</div>
          </div>
          <div className="flex-1 text-center text-xs text-slate-400">
            <div className="border-t border-dashed border-slate-300 relative top-2" />
            <span className="relative bg-white px-2">{formatar.duracao(voo.horarioprevistopartida, voo.horarioprevistochegada)}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold">{formatar.hora(voo.horarioprevistochegada)}</div>
            <div className="text-sm font-medium">{voo.destino}</div>
            <div className="text-xs text-slate-500">{voo.aeroportodestino}</div>
          </div>
        </div>
      </div>

      <div className="md:w-48 md:border-l md:pl-5 border-slate-200 flex md:flex-col items-center md:items-end justify-between gap-2">
        <div className="md:text-right">
          <div className="text-xs text-slate-500">a partir de</div>
          <div className="text-2xl font-black text-sky-700">{formatar.dinheiro(voo.valorbase)}</div>
          <div className={`text-xs font-semibold ${poucosLugares ? 'text-red-600' : 'text-slate-500'}`}>
            {voo.assentosdisponiveis} assento(s) livre(s)
          </div>
        </div>
        <button onClick={aoEscolher} className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold">
          Escolher assento
        </button>
      </div>
    </div>
  )
}
