import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cliente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

// a api manda uma linha por passagem entao junto pelo codigo da reserva
function agruparPorReserva(linhas) {
  const reservas = []
  for (const linha of linhas) {
    let reserva = reservas.find((r) => r.codigo === linha.codigoreserva)
    if (!reserva) {
      reserva = {
        codigo: linha.codigoreserva,
        status: linha.statuscompra,
        pagamento: linha.formapagamento,
        passagens: [],
      }
      reservas.push(reserva)
    }
    reserva.passagens.push(linha)
  }
  return reservas
}

export default function MinhasCompras() {
  const { usuario } = useUsuario()
  const [compras, setCompras] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .minhasCompras(usuario.cpf)
      .then(setCompras)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [usuario.cpf])

  if (carregando) return <Carregando texto="Buscando suas compras..." />

  const reservas = agruparPorReserva(compras)
  const totalGasto = compras.reduce((soma, p) => soma + Number(p.valorpago), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas compras</h1>
        {compras.length > 0 && (
          <p className="text-sm text-slate-500">
            {reservas.length} reserva(s) · {compras.length} passagem(ns) · total gasto {formatar.dinheiro(totalGasto)}
          </p>
        )}
      </div>

      <Mensagem texto={erro} />

      {!erro && reservas.length === 0 && (
        <div className="bg-white border border-slate-200 p-6 text-center space-y-2">
          <p className="text-slate-500">Você ainda não comprou nenhuma passagem.</p>
          <Link to="/cliente/voos" className="text-blue-800 font-semibold hover:underline">
            Buscar voos
          </Link>
        </div>
      )}

      {reservas.map((r) => (
        <CartaoReserva key={r.codigo} reserva={r} />
      ))}
    </div>
  )
}

function CartaoReserva({ reserva }) {
  const total = reserva.passagens.reduce((soma, p) => soma + Number(p.valorpago), 0)

  return (
    <div className="bg-white border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono font-bold">{reserva.codigo}</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800">{reserva.status}</span>
          <span className="text-sm text-slate-500">{reserva.pagamento}</span>
        </div>
        <span className="font-bold text-blue-800">{formatar.dinheiro(total)}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-2 font-semibold">Voo</th>
              <th className="px-3 py-2 font-semibold">Trajeto</th>
              <th className="px-3 py-2 font-semibold">Partida</th>
              <th className="px-3 py-2 font-semibold">Assento</th>
              <th className="px-3 py-2 font-semibold">Tipo</th>
              <th className="px-3 py-2 font-semibold">Embarque</th>
              <th className="px-5 py-2 font-semibold text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {reserva.passagens.map((p) => (
              <tr key={p.numpassagem} className="border-t border-slate-100">
                <td className="px-5 py-2.5 font-mono">{p.numvoo}</td>
                <td className="px-3 py-2.5">
                  {p.origem} para {p.destino}
                  <div className="text-xs text-slate-500">
                    {p.aeroportoorigem} · {p.aeroportodestino}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">{formatar.dataHora(p.horarioprevistopartida)}</td>
                <td className="px-3 py-2.5 font-semibold">{p.numeroassento}</td>
                <td className="px-3 py-2.5">{p.nometipo}</td>
                <td className="px-3 py-2.5">
                  {p.statusembarque}
                  <div className="text-xs text-slate-500 font-mono">{p.numembarque}</div>
                </td>
                <td className="px-5 py-2.5 text-right whitespace-nowrap">{formatar.dinheiro(p.valorpago)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
