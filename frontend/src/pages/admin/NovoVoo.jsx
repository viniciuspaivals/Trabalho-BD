import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { admin, gerente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FORM_VAZIO = {
  num_voo: '',
  num_trajeto: '',
  num_aeronave: '',
  partida: '',
  chegada: '',
  valor_base: '',
  cpf_piloto: '',
  cpf_copiloto: '',
}

export default function NovoVoo() {
  const { usuario } = useUsuario()
  const navigate = useNavigate()
  const [trajetos, setTrajetos] = useState([])
  const [aeronaves, setAeronaves] = useState([])
  const [tripulantes, setTripulantes] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [comissarios, setComissarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    Promise.all([gerente.listarTrajetos(), gerente.listarAeronaves(), gerente.listarTripulantes()])
      .then(([t, a, tr]) => {
        setTrajetos(t)
        setAeronaves(a)
        setTripulantes(tr)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function marcarComissario(cpf) {
    setComissarios((atual) => (atual.includes(cpf) ? atual.filter((c) => c !== cpf) : [...atual, cpf]))
  }

  // mesmas regras dos triggers so que antes de mandar
  function validar() {
    if (form.chegada <= form.partida) return 'A chegada precisa ser depois da partida.'
    if (Number(form.valor_base) <= 0) return 'O valor base precisa ser maior que zero.'
    if (form.cpf_piloto === form.cpf_copiloto) return 'O piloto e o copiloto precisam ser pessoas diferentes.'
    if (comissarios.length < 2) return 'Escolha pelo menos 2 comissários.'
    return ''
  }

  async function salvar() {
    const problema = validar()
    if (problema) return setErro(problema)
    setErro('')
    setSalvando(true)
    const numVoo = form.num_voo.trim().toUpperCase()
    try {
      await admin.criarVoo({
        num_voo: numVoo,
        data_voo: form.partida.slice(0, 10),
        horario_previsto_partida: form.partida,
        horario_previsto_chegada: form.chegada,
        valor_base: Number(form.valor_base),
        cpf_administrador: usuario.cpf,
        num_aeronave: form.num_aeronave,
        num_trajeto: form.num_trajeto,
        cpf_piloto: form.cpf_piloto,
        cpf_copiloto: form.cpf_copiloto,
        cpfs_comissarios: comissarios,
      })
      setSucesso(`Voo ${numVoo} criado! Voltando para a lista...`)
      setTimeout(() => navigate('/admin/voos'), 1500)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <Carregando texto="Carregando trajetos, aeronaves e tripulantes..." />

  const tecnicos = tripulantes.filter((t) => t.tipo === 'tecnico')
  const listaComissarios = tripulantes.filter((t) => t.tipo === 'comissario')
  const aeronave = aeronaves.find((a) => a.id_aeronave === form.num_aeronave)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/voos" className="text-sm text-blue-800 font-semibold hover:underline">
          Voltar para os voos
        </Link>
        <h1 className="text-2xl font-bold mt-2">Novo voo</h1>
        <p className="text-sm text-slate-500">O voo começa como programado. Precisa de piloto, copiloto e pelo menos 2 comissários.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
        className="space-y-4"
      >
        <div className="bg-white border border-slate-200 p-4 space-y-3">
          <p className="font-semibold">Dados do voo</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Número do voo</span>
              <input
                value={form.num_voo}
                onChange={(e) => alterar('num_voo', e.target.value)}
                placeholder="Ex.: VOO-2001"
                maxLength={20}
                required
                className={ESTILO_CAMPO}
              />
            </label>
            <Selecao rotulo="Trajeto" valor={form.num_trajeto} aoMudar={(v) => alterar('num_trajeto', v)}>
              {trajetos.map((t) => (
                <option key={t.numtrajeto} value={t.numtrajeto}>
                  {t.numtrajeto} · {t.origem} para {t.destino}
                </option>
              ))}
            </Selecao>
            <Selecao rotulo="Aeronave" valor={form.num_aeronave} aoMudar={(v) => alterar('num_aeronave', v)}>
              {aeronaves.map((a) => (
                <option key={a.id_aeronave} value={a.id_aeronave}>
                  {a.id_aeronave} · {a.modelo} ({a.numassentos} lugares)
                </option>
              ))}
            </Selecao>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Partida</span>
              <input
                type="datetime-local"
                value={form.partida}
                onChange={(e) => alterar('partida', e.target.value)}
                required
                className={ESTILO_CAMPO}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Chegada</span>
              <input
                type="datetime-local"
                value={form.chegada}
                min={form.partida || undefined}
                onChange={(e) => alterar('chegada', e.target.value)}
                required
                className={ESTILO_CAMPO}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Valor base (R$)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.valor_base}
                onChange={(e) => alterar('valor_base', e.target.value)}
                placeholder="Ex.: 450"
                required
                className={ESTILO_CAMPO}
              />
            </label>
          </div>
          {(aeronave || (form.partida && form.chegada)) && (
            <p className="text-xs text-slate-500">
              {form.partida && form.chegada && `Duração ${formatar.duracao(form.partida, form.chegada)}. `}
              {aeronave && `${aeronave.numassentos} assentos à venda.`}
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200 p-4 space-y-3">
          <p className="font-semibold">Tripulação</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Selecao rotulo="Piloto" valor={form.cpf_piloto} aoMudar={(v) => alterar('cpf_piloto', v)}>
              {tecnicos.map((t) => (
                <option key={t.cpf} value={t.cpf} disabled={t.cpf === form.cpf_copiloto}>
                  {t.nome} · {t.codigoanac}
                </option>
              ))}
            </Selecao>
            <Selecao rotulo="Copiloto" valor={form.cpf_copiloto} aoMudar={(v) => alterar('cpf_copiloto', v)}>
              {tecnicos.map((t) => (
                <option key={t.cpf} value={t.cpf} disabled={t.cpf === form.cpf_piloto}>
                  {t.nome} · {t.codigoanac}
                </option>
              ))}
            </Selecao>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600">
              Comissários ({comissarios.length} escolhido{comissarios.length === 1 ? '' : 's'})
            </span>
            {listaComissarios.length === 0 ? (
              <p className="text-sm text-slate-500 mt-1">Nenhum comissário cadastrado.</p>
            ) : (
              <div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {listaComissarios.map((c) => (
                  <label
                    key={c.cpf}
                    className={`flex items-center gap-2 border px-3 py-2 text-sm cursor-pointer ${
                      comissarios.includes(c.cpf) ? 'border-blue-800 bg-blue-50' : 'border-slate-300'
                    }`}
                  >
                    <input type="checkbox" checked={comissarios.includes(c.cpf)} onChange={() => marcarComissario(c.cpf)} />
                    {c.nome}
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            O banco ainda confere se a aeronave e os tripulantes estão livres nesse horário e o descanso de cada um.
          </p>
        </div>

        <Mensagem texto={erro} aoFechar={() => setErro('')} />
        <Mensagem tipo="sucesso" texto={sucesso} />

        <div className="flex gap-2">
          <button
            disabled={salvando || !!sucesso}
            className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-bold"
          >
            {salvando ? 'Criando...' : 'Criar voo'}
          </button>
          <Link to="/admin/voos" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

const ESTILO_CAMPO = 'mt-1 w-full px-3 py-2 border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700'

function Selecao({ rotulo, valor, aoMudar, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
      <select value={valor} onChange={(e) => aoMudar(e.target.value)} required className={ESTILO_CAMPO}>
        <option value="">Escolha...</option>
        {children}
      </select>
    </label>
  )
}
