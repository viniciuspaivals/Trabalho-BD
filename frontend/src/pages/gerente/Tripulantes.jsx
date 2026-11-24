import { useEffect, useState } from 'react'
import { gerente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import * as formatar from '../../formatar.js'
import Mensagem from '../../components/Mensagem.jsx'
import Carregando from '../../components/Carregando.jsx'

const FORM_VAZIO = {
  tipo: 'tecnico',
  cpf: '',
  nome: '',
  email: '',
  telefone: '',
  data_de_nascimento: '',
  num_credencial: '',
  codigo_anac: '',
}

const NOME_TIPO = { tecnico: 'Técnico', comissario: 'Comissário' }

export default function Tripulantes() {
  const { usuario } = useUsuario()
  const [tripulantes, setTripulantes] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [editando, setEditando] = useState(null) // cpf do tripulante sendo editado
  const [filtro, setFiltro] = useState('todos')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    try {
      setTripulantes(await gerente.listarTripulantes())
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
    setEditando(t.cpf)
    setForm({
      tipo: t.tipo,
      cpf: t.cpf,
      nome: t.nome,
      email: t.email,
      telefone: t.telefone || '',
      data_de_nascimento: String(t.datadenascimento || '').slice(0, 10),
      num_credencial: t.numcredencial,
      codigo_anac: t.codigoanac || '',
    })
    setErro('')
    setSucesso('')
  }

  function cancelar() {
    setEditando(null)
    setForm(FORM_VAZIO)
  }

  async function salvar() {
    if (form.cpf.length !== 11) return setErro('O CPF precisa ter 11 números.')
    const tecnico = form.tipo === 'tecnico'
    if (tecnico && !form.codigo_anac.trim()) return setErro('Tripulante técnico precisa do código ANAC.')
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      const dados = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim() || null,
        data_de_nascimento: form.data_de_nascimento,
        num_credencial: form.num_credencial.trim(),
        // comissario nao tem codigo anac
        codigo_anac: tecnico ? form.codigo_anac.trim() : null,
      }
      if (editando) {
        await gerente.editarTripulante(editando, dados)
        setSucesso(`${dados.nome} atualizado.`)
      } else {
        await gerente.criarTripulante({ ...dados, cpf: form.cpf, tipo: form.tipo, cpf_gerente: usuario.cpf })
        setSucesso(`${dados.nome} cadastrado como ${NOME_TIPO[form.tipo].toLowerCase()}.`)
      }
      cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(t) {
    if (!window.confirm(`Remover ${t.nome}?`)) return
    setErro('')
    setSucesso('')
    try {
      await gerente.removerTripulante(t.cpf)
      setSucesso(`${t.nome} removido.`)
      if (editando === t.cpf) cancelar()
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  const lista = filtro === 'todos' ? tripulantes : tripulantes.filter((t) => t.tipo === filtro)
  const qtd = (tipo) => tripulantes.filter((t) => t.tipo === tipo).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tripulantes</h1>
        <p className="text-sm text-slate-500">Pilotos e copilotos (técnicos) e comissários de bordo.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
        className="bg-white border border-slate-200 p-4 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">{editando ? `Editando ${form.nome}` : 'Novo tripulante'}</p>
          {/* o tipo nao muda depois de cadastrado */}
          <div className="flex">
            {Object.entries(NOME_TIPO).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                disabled={!!editando}
                onClick={() => alterar('tipo', valor)}
                className={`px-4 py-1.5 text-sm font-semibold border disabled:opacity-60 ${
                  form.tipo === valor ? 'bg-blue-800 border-blue-800 text-white' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                {texto}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            rotulo="CPF"
            valor={form.cpf}
            aoMudar={(v) => alterar('cpf', v.replace(/\D/g, '').slice(0, 11))}
            placeholder="Somente números"
            desativado={!!editando}
          />
          <Campo rotulo="Nome" valor={form.nome} aoMudar={(v) => alterar('nome', v)} tamanho={100} />
          <Campo rotulo="E-mail" tipo="email" valor={form.email} aoMudar={(v) => alterar('email', v)} tamanho={100} />
          <Campo
            rotulo="Telefone"
            tipo="tel"
            valor={form.telefone}
            aoMudar={(v) => alterar('telefone', v)}
            placeholder="Opcional"
            tamanho={20}
            obrigatorio={false}
          />
          <Campo
            rotulo="Data de nascimento"
            tipo="date"
            valor={form.data_de_nascimento}
            aoMudar={(v) => alterar('data_de_nascimento', v)}
          />
          <Campo rotulo="Nº de credencial" valor={form.num_credencial} aoMudar={(v) => alterar('num_credencial', v)} tamanho={50} />
          {form.tipo === 'tecnico' && (
            <Campo rotulo="Código ANAC" valor={form.codigo_anac} aoMudar={(v) => alterar('codigo_anac', v)} tamanho={50} />
          )}
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

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          ['todos', `Todos (${tripulantes.length})`],
          ['tecnico', `Técnicos (${qtd('tecnico')})`],
          ['comissario', `Comissários (${qtd('comissario')})`],
        ].map(([valor, texto]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`px-3 py-1.5 border font-medium ${
              filtro === valor ? 'bg-blue-800 border-blue-800 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      {carregando ? (
        <Carregando texto="Buscando tripulantes..." />
      ) : lista.length === 0 ? (
        !erro && <p className="text-center text-slate-500 py-8">Nenhum tripulante encontrado.</p>
      ) : (
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-semibold">Nome</th>
                <th className="px-4 py-2 font-semibold">Tipo</th>
                <th className="px-4 py-2 font-semibold">Credencial</th>
                <th className="px-4 py-2 font-semibold">Código ANAC</th>
                <th className="px-4 py-2 font-semibold">Horas no dia</th>
                <th className="px-4 py-2 font-semibold">Fim do descanso</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {lista.map((t) => (
                <tr key={t.cpf} className={`border-t border-slate-100 ${editando === t.cpf ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold">{t.nome}</div>
                    <div className="text-xs text-slate-500">
                      {t.cpf} · {t.email}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 ${
                        t.tipo === 'tecnico' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {NOME_TIPO[t.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono">{t.numcredencial}</td>
                  <td className="px-4 py-2.5 font-mono">{t.codigoanac || '-'}</td>
                  <td className="px-4 py-2.5">{Number(t.horasvoadasdia || 0).toFixed(1)}h</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{t.fimultimodescanso ? formatar.dataHora(t.fimultimodescanso) : '-'}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => comecarEdicao(t)} className="text-blue-800 font-semibold hover:underline">
                      Editar
                    </button>
                    <button onClick={() => remover(t)} className="text-red-700 font-semibold hover:underline">
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

function Campo({ rotulo, valor, aoMudar, tipo = 'text', placeholder, tamanho, desativado = false, obrigatorio = true }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        maxLength={tamanho}
        disabled={desativado}
        required={obrigatorio}
        className="mt-1 w-full px-3 py-2 border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
    </label>
  )
}
