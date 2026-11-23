import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cliente } from '../../api.js'
import { gerarFileiras } from '../../assentos.js'
import { useUsuario } from '../../usuario.jsx'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FORMAS_PAGAMENTO = ['PIX', 'Cartão de Crédito', 'Boleto']

export default function Assentos() {
  const { numVoo } = useParams() // numero do voo que vem da url
  const { usuario } = useUsuario()
  const [mapa, setMapa] = useState(null)
  const [voo, setVoo] = useState(null)
  const [tipos, setTipos] = useState([])
  const [assento, setAssento] = useState('')
  const [tipo, setTipo] = useState('')
  const [pagamento, setPagamento] = useState(FORMAS_PAGAMENTO[0])
  const [carregando, setCarregando] = useState(true)
  const [comprando, setComprando] = useState(false)
  const [erro, setErro] = useState('')
  const [compra, setCompra] = useState(null)

  async function carregarMapa() {
    setMapa(await cliente.assentosDoVoo(numVoo))
  }

  useEffect(() => {
    async function carregar() {
      try {
        // a rota de assentos nao manda o valor base entao pego da lista de voos
        const [assentos, listaTipos, voos] = await Promise.all([
          cliente.assentosDoVoo(numVoo),
          cliente.tiposPassagem(),
          cliente.listarVoos(),
        ])
        setMapa(assentos)
        setTipos(listaTipos)
        setTipo(listaTipos[0]?.nometipo || '')
        setVoo(voos.find((v) => v.numvoo === numVoo) || null)
      } catch (e) {
        setErro(e.message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [numVoo])

  function preco(multiplicador) {
    if (!voo) return '-'
    return formatar.dinheiro(Number(voo.valorbase) * Number(multiplicador))
  }

  async function comprar() {
    setErro('')
    setCompra(null)
    setComprando(true)
    try {
      const resposta = await cliente.comprar({
        cpf_cliente: usuario.cpf,
        forma_pagamento: pagamento,
        num_voo: numVoo,
        nome_tipo: tipo,
        numero_assento: assento,
      })
      setCompra({ ...resposta, assento, tipo })
      setAssento('')
      await carregarMapa()
    } catch (e) {
      // se alguem pegou o assento antes recarrega pra mostrar ocupado
      setErro(e.message)
      setAssento('')
      carregarMapa().catch(() => {})
    } finally {
      setComprando(false)
    }
  }

  if (carregando) return <Carregando texto="Carregando assentos..." />
  if (!mapa) return <Mensagem texto={erro} />

  const ocupados = new Set(mapa.assentos_ocupados)
  const livres = mapa.capacidade - ocupados.size

  return (
    <div className="space-y-6">
      <div>
        <Link to="/cliente/voos" className="text-sm text-blue-800 font-semibold hover:underline">
          Voltar para os voos
        </Link>
        <h1 className="text-2xl font-bold mt-2">Escolher assento no voo {numVoo}</h1>
        <p className="text-sm text-slate-500">
          {voo && `${voo.origem} para ${voo.destino} · ${formatar.dataHora(voo.horarioprevistopartida)} · `}
          {mapa.aeronave} · {livres} de {mapa.capacidade} assento(s) livre(s)
        </p>
      </div>

      {compra && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 space-y-1 text-sm text-emerald-900">
          <p className="font-bold">Compra confirmada</p>
          <p>
            Reserva <strong>{compra.codigo_reserva}</strong> · assento {compra.assento} · {compra.tipo} · valor pago{' '}
            {formatar.dinheiro(compra.valor_pago)}
          </p>
          <Link to="/cliente/compras" className="inline-block font-semibold text-emerald-800 hover:underline">
            Ver minhas compras
          </Link>
        </div>
      )}

      <Mensagem texto={erro} aoFechar={() => setErro('')} />

      <div className="grid gap-6 md:grid-cols-[1fr_320px] items-start">
        <div className="bg-white border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <Legenda classe="bg-white border-slate-400" texto="Livre" />
            <Legenda classe="bg-blue-800 border-blue-800" texto="Selecionado" />
            <Legenda classe="bg-slate-300 border-slate-300" texto="Ocupado" />
          </div>

          <div className="overflow-x-auto">
            <div className="w-max mx-auto space-y-2">
              {gerarFileiras(mapa.capacidade).map((fileira, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs text-slate-400">{i + 1}</span>
                  {fileira.map((num, j) => (
                    <div key={num} className={`flex ${j === 3 ? 'ml-6' : ''}`}>
                      <BotaoAssento
                        numero={num}
                        ocupado={ocupados.has(num)}
                        selecionado={assento === num}
                        aoClicar={() => setAssento(num)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-600">Assento escolhido</p>
            <p className="text-2xl font-bold">{assento || '-'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Tipo de passagem</p>
            {tipos.map((t) => (
              <label
                key={t.nometipo}
                className={`flex items-center justify-between gap-2 border px-3 py-2 text-sm cursor-pointer ${
                  tipo === t.nometipo ? 'border-blue-800 bg-blue-50' : 'border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="tipo" checked={tipo === t.nometipo} onChange={() => setTipo(t.nometipo)} />
                  {t.nometipo}
                </span>
                <span className="font-semibold">{preco(t.multiplicador)}</span>
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Forma de pagamento</span>
            <select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              {FORMAS_PAGAMENTO.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>

          <button
            onClick={comprar}
            disabled={!assento || !tipo || comprando}
            className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold"
          >
            {comprando ? 'Comprando...' : 'Comprar passagem'}
          </button>
          {!assento && <p className="text-xs text-slate-500 text-center">Escolha um assento no mapa</p>}
        </div>
      </div>
    </div>
  )
}

function BotaoAssento({ numero, ocupado, selecionado, aoClicar }) {
  let estilo = 'bg-white border-slate-400 text-slate-700 hover:border-blue-800'
  if (ocupado) estilo = 'bg-slate-300 border-slate-300 text-slate-400 cursor-not-allowed'
  else if (selecionado) estilo = 'bg-blue-800 border-blue-800 text-white'

  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={ocupado}
      title={ocupado ? `${numero} ocupado` : numero}
      className={`w-10 h-10 border text-xs font-semibold ${estilo}`}
    >
      {numero}
    </button>
  )
}

function Legenda({ classe, texto }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-4 h-4 border ${classe}`} />
      {texto}
    </span>
  )
}
