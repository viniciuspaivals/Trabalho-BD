import { useEffect, useState } from 'react'
import { gerente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FORM_VAZIO = { num_trajeto: '', origem: '', aeroporto_origem: '', destino: '', aeroporto_destino: '' }

export default function Trajetos() {
  const { usuario } = useUsuario()
  const [trajetos, setTrajetos] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [editando, setEditando] = useState(null) // numero do trajeto sendo editado
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    try {
      setTrajetos(await gerente.listarTrajetos())
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function comecarEdicao(t) {
    setEditando(t.numtrajeto)
    setForm({
      num_trajeto: t.numtrajeto,
      origem: t.origem,
      aeroporto_origem: t.aeroportoorigem,
      destino: t.destino,
      aeroporto_destino: t.aeroportodestino,
    })
    setErro('')
    setSucesso('')
  }

  function cancelar() {
    setEditando(null)
    setForm(FORM_VAZIO)
  }

  async function salvar() {
    const dados = {
      origem: form.origem.trim(),
      aeroporto_origem: form.aeroporto_origem.trim(),
      destino: form.destino.trim(),
      aeroporto_destino: form.aeroporto_destino.trim(),
    }
    if (dados.aeroporto_origem.toLowerCase() === dados.aeroporto_destino.toLowerCase()) {
      return setErro('O aeroporto de origem e o de destino precisam ser diferentes.')
    }
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      if (editando) {
        await gerente.editarTrajeto(editando, dados)
        setSucesso(`Trajeto ${editando} atualizado.`)
      } else {
        const num = form.num_trajeto.trim().toUpperCase()
        await gerente.criarTrajeto({ ...dados, num_trajeto: num, cpf_gerente: usuario.cpf })
        setSucesso(`Trajeto ${num} cadastrado.`)
      }
      cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(num) {
    if (!window.confirm(`Remover o trajeto ${num}?`)) return
    setErro('')
    setSucesso('')
    try {
      await gerente.removerTrajeto(num)
      setSucesso(`Trajeto ${num} removido.`)
      if (editando === num) cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trajetos</h1>
        <p className="text-sm text-slate-500">Rotas entre aeroportos que podem ser usadas nos voos.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
        className="bg-white border border-slate-200 p-4 space-y-3"
      >
        <p className="font-semibold">{editando ? `Editando ${editando}` : 'Novo trajeto'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            rotulo="Código"
            valor={form.num_trajeto}
            aoMudar={(v) => alterar('num_trajeto', v)}
            placeholder="Ex.: TRJ-CNF-GRU"
            tamanho={20}
            desativado={!!editando}
          />
          <div className="hidden sm:block" />
          <Campo rotulo="Cidade de origem" valor={form.origem} aoMudar={(v) => alterar('origem', v)} placeholder="Ex.: Belo Horizonte, MG" />
          <Campo rotulo="Cidade de destino" valor={form.destino} aoMudar={(v) => alterar('destino', v)} placeholder="Ex.: São Paulo, SP" />
          <Campo
            rotulo="Aeroporto de origem"
            valor={form.aeroporto_origem}
            aoMudar={(v) => alterar('aeroporto_origem', v)}
            placeholder="Ex.: Aeroporto Internacional de Confins (CNF)"
          />
          <Campo
            rotulo="Aeroporto de destino"
            valor={form.aeroporto_destino}
            aoMudar={(v) => alterar('aeroporto_destino', v)}
            placeholder="Ex.: Aeroporto Internacional de Guarulhos (GRU)"
          />
        </div>
        <div className="flex gap-2">
          <button disabled={salvando} className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-bold">
            {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
          </button>
          {editando && (
            <button type="button" onClick={cancelar} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <Mensagem texto={erro} aoFechar={() => setErro('')} />
      <Mensagem tipo="sucesso" texto={sucesso} aoFechar={() => setSucesso('')} />

      {carregando ? (
        <Carregando texto="Buscando trajetos..." />
      ) : trajetos.length === 0 ? (
        !erro && <p className="text-center text-slate-500 py-8">Nenhum trajeto cadastrado.</p>
      ) : (
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-semibold">Código</th>
                <th className="px-4 py-2 font-semibold">Origem</th>
                <th className="px-4 py-2 font-semibold">Destino</th>
                <th className="px-4 py-2 font-semibold">Gerente</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {trajetos.map((t) => (
                <tr key={t.numtrajeto} className={`border-t border-slate-100 ${editando === t.numtrajeto ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono font-semibold whitespace-nowrap">{t.numtrajeto}</td>
                  <td className="px-4 py-2.5">
                    {t.origem}
                    <div className="text-xs text-slate-500">{t.aeroportoorigem}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    {t.destino}
                    <div className="text-xs text-slate-500">{t.aeroportodestino}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{t.cpf_gerente}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => comecarEdicao(t)} className="text-blue-800 font-semibold hover:underline">
                      Editar
                    </button>
                    <button onClick={() => remover(t.numtrajeto)} className="text-red-700 font-semibold hover:underline">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Campo({ rotulo, valor, aoMudar, placeholder, tamanho = 100, desativado = false }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
      <input
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        maxLength={tamanho}
        disabled={desativado}
        required
        className="mt-1 w-full px-3 py-2 border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
    </label>
  )
}
