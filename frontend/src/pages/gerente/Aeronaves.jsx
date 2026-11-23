import { useEffect, useState } from 'react'
import { gerente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FORM_VAZIO = { id_aeronave: '', modelo: '', num_assentos: '' }

export default function Aeronaves() {
  const { usuario } = useUsuario()
  const [aeronaves, setAeronaves] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [editando, setEditando] = useState(null) // id da aeronave sendo editada
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    try {
      setAeronaves(await gerente.listarAeronaves())
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

  function comecarEdicao(a) {
    setEditando(a.id_aeronave)
    setForm({ id_aeronave: a.id_aeronave, modelo: a.modelo, num_assentos: String(a.numassentos) })
    setErro('')
    setSucesso('')
  }

  function cancelar() {
    setEditando(null)
    setForm(FORM_VAZIO)
  }

  async function salvar() {
    const numAssentos = Number(form.num_assentos)
    if (!Number.isInteger(numAssentos) || numAssentos <= 0) return setErro('O número de assentos precisa ser maior que zero.')
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      const dados = { modelo: form.modelo.trim(), num_assentos: numAssentos }
      if (editando) {
        await gerente.editarAeronave(editando, dados)
        setSucesso(`Aeronave ${editando} atualizada.`)
      } else {
        const id = form.id_aeronave.trim().toUpperCase()
        await gerente.criarAeronave({ ...dados, id_aeronave: id, cpf_gerente: usuario.cpf })
        setSucesso(`Aeronave ${id} cadastrada.`)
      }
      cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id) {
    if (!window.confirm(`Remover a aeronave ${id}?`)) return
    setErro('')
    setSucesso('')
    try {
      await gerente.removerAeronave(id)
      setSucesso(`Aeronave ${id} removida.`)
      if (editando === id) cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aeronaves</h1>
        <p className="text-sm text-slate-500">Cadastro das aeronaves usadas nos voos.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
        className="bg-white border border-slate-200 p-4 space-y-3"
      >
        <p className="font-semibold">{editando ? `Editando ${editando}` : 'Nova aeronave'}</p>
        <div className="grid gap-3 sm:grid-cols-4 items-end">
          <Campo
            rotulo="Prefixo"
            valor={form.id_aeronave}
            aoMudar={(v) => alterar('id_aeronave', v)}
            placeholder="Ex.: PR-ABC"
            tamanho={20}
            desativado={!!editando}
          />
          <Campo rotulo="Modelo" valor={form.modelo} aoMudar={(v) => alterar('modelo', v)} placeholder="Ex.: Airbus A320" tamanho={50} />
          <Campo rotulo="Assentos" tipo="number" valor={form.num_assentos} aoMudar={(v) => alterar('num_assentos', v)} />
          <div className="flex gap-2">
            <button disabled={salvando} className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-bold">
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </button>
            {editando && (
              <button type="button" onClick={cancelar} className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
                Cancelar
              </button>
            )}
          </div>
        </div>
        {/* mesma regra do assentos.js */}
        <p className="text-xs text-slate-500">Até 20 assentos o mapa fica com 2 por fileira, acima disso com 6 por fileira.</p>
      </form>

      <Mensagem texto={erro} aoFechar={() => setErro('')} />
      <Mensagem tipo="sucesso" texto={sucesso} aoFechar={() => setSucesso('')} />

      {carregando ? (
        <Carregando texto="Buscando aeronaves..." />
      ) : aeronaves.length === 0 ? (
        !erro && <p className="text-center text-slate-500 py-8">Nenhuma aeronave cadastrada.</p>
      ) : (
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-semibold">Prefixo</th>
                <th className="px-4 py-2 font-semibold">Modelo</th>
                <th className="px-4 py-2 font-semibold">Assentos</th>
                <th className="px-4 py-2 font-semibold">Gerente</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {aeronaves.map((a) => (
                <tr key={a.id_aeronave} className={`border-t border-slate-100 ${editando === a.id_aeronave ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono font-semibold">{a.id_aeronave}</td>
                  <td className="px-4 py-2.5">{a.modelo}</td>
                  <td className="px-4 py-2.5">{a.numassentos}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{a.cpf_gerente}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => comecarEdicao(a)} className="text-blue-800 font-semibold hover:underline">
                      Editar
                    </button>
                    <button onClick={() => remover(a.id_aeronave)} className="text-red-700 font-semibold hover:underline">
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

function Campo({ rotulo, valor, aoMudar, tipo = 'text', placeholder, tamanho, desativado = false }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        maxLength={tamanho}
        min={tipo === 'number' ? 1 : undefined}
        disabled={desativado}
        required
        className="mt-1 w-full px-3 py-2 border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
    </label>
  )
}
