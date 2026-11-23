import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../api.js'
import Mensagem from '../components/Mensagem.jsx'

const FORM_VAZIO = { cpf: '', nome: '', email: '', telefone: '', data_de_nascimento: '' }

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_VAZIO)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function cadastrar() {
    if (form.cpf.length !== 11) return setErro('O CPF precisa ter 11 números.')
    setErro('')
    setCarregando(true)
    try {
      // telefone nao e obrigatorio entao vazio vai como null
      await auth.cadastrarCliente({ ...form, nome: form.nome.trim(), telefone: form.telefone.trim() || null })
      setSucesso('Cadastro feito! Voltando para o login...')
      setForm(FORM_VAZIO)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  // cpf aceita so numero
  const mudarCpf = (v) => alterar('cpf', v.replace(/\D/g, '').slice(0, 11))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-blue-900">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center text-white space-y-2">
          <img src="/aviao.svg" alt="" className="w-14 h-14 mx-auto" />
          <h1 className="text-3xl font-extrabold">Criar conta</h1>
          <p className="text-sky-200 text-sm">Cadastro de cliente para comprar passagens</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            cadastrar()
          }}
          className="bg-white shadow-md p-6 space-y-4"
        >
          <Campo rotulo="CPF" valor={form.cpf} aoMudar={mudarCpf} placeholder="Somente números" obrigatorio />
          <Campo rotulo="Nome completo" valor={form.nome} aoMudar={(v) => alterar('nome', v)} tamanho={100} obrigatorio />
          <Campo rotulo="E-mail" tipo="email" valor={form.email} aoMudar={(v) => alterar('email', v)} tamanho={100} obrigatorio />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Telefone"
              tipo="tel"
              valor={form.telefone}
              aoMudar={(v) => alterar('telefone', v)}
              placeholder="Opcional"
              tamanho={20}
            />
            <Campo
              rotulo="Data de nascimento"
              tipo="date"
              valor={form.data_de_nascimento}
              aoMudar={(v) => alterar('data_de_nascimento', v)}
              obrigatorio
            />
          </div>

          <Mensagem texto={erro} />
          <Mensagem tipo="sucesso" texto={sucesso} />

          <button
            disabled={carregando || !!sucesso}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold"
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-sky-700 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Campo({ rotulo, valor, aoMudar, tipo = 'text', placeholder, tamanho, obrigatorio = false }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        maxLength={tamanho}
        required={obrigatorio}
        className="mt-1 w-full px-3 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  )
}
