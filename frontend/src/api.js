// funcoes que chamam a api

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// faz a requisicao e se der erro joga a mensagem que veio do banco
async function requisicao(metodo, caminho, corpo) {
  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Ela está rodando em ' + API_URL + '?')
  }

  const texto = await resposta.text()
  const dados = texto ? JSON.parse(texto) : null

  if (!resposta.ok) {
    throw new Error(mensagemDeErro(dados, resposta.status))
  }
  return dados
}

// o detail do fastapi pode ser texto ou lista de erros do pydantic
function mensagemDeErro(dados, status) {
  const detalhe = dados?.detail
  if (typeof detalhe === 'string') return detalhe
  if (Array.isArray(detalhe)) {
    return detalhe
      .map((e) => `${(e.loc || []).slice(1).join('.') || 'campo'}: ${e.msg}`)
      .join(' | ')
  }
  return `Erro ${status} na API.`
}

const get = (caminho) => requisicao('GET', caminho)
const post = (caminho, corpo) => requisicao('POST', caminho, corpo)
const put = (caminho, corpo) => requisicao('PUT', caminho, corpo)
const patch = (caminho, corpo) => requisicao('PATCH', caminho, corpo)
const del = (caminho) => requisicao('DELETE', caminho)

const q = (texto) => encodeURIComponent(texto)

// login e cadastro
export const auth = {
  // identificador pode ser cpf email ou credencial e volta os dados com a lista de papeis
  login: (identificador) => post('/auth/login', { identificador }),

  // manda cpf nome email telefone e data de nascimento
  cadastrarCliente: (dados) => post('/auth/register', dados),
}

// rotas do cliente
export const cliente = {
  // filtros opcionais origem destino e data_voo
  listarVoos: (filtros = {}) => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor) params.append(chave, valor)
    })
    const qs = params.toString()
    return get(`/cliente/voos${qs ? `?${qs}` : ''}`)
  },

  // volta a capacidade e a lista de assentos ocupados
  assentosDoVoo: (numVoo) => get(`/cliente/voos/${q(numVoo)}/assentos`),

  tiposPassagem: () => get('/cliente/tipos-passagem'),

  // manda cpf_cliente forma_pagamento num_voo nome_tipo e numero_assento
  comprar: (dados) => post('/cliente/compras', dados),

  minhasCompras: (cpf) => get(`/cliente/${q(cpf)}/compras`),
}

// rotas do gerente
export const gerente = {
  // aeronaves precisam de id modelo num_assentos e cpf_gerente
  listarAeronaves: () => get('/gerente/aeronaves'),
  criarAeronave: (dados) => post('/gerente/aeronaves', dados),
  editarAeronave: (id, dados) => put(`/gerente/aeronaves/${q(id)}`, dados),
  removerAeronave: (id) => del(`/gerente/aeronaves/${q(id)}`),

  // trajetos precisam de origem destino os dois aeroportos e cpf_gerente
  listarTrajetos: () => get('/gerente/trajetos'),
  criarTrajeto: (dados) => post('/gerente/trajetos', dados),
  editarTrajeto: (num, dados) => put(`/gerente/trajetos/${q(num)}`, dados),
  removerTrajeto: (num) => del(`/gerente/trajetos/${q(num)}`),

  // tripulante tem tipo tecnico ou comissario e so o tecnico tem codigo_anac
  listarTripulantes: () => get('/gerente/tripulantes'),
  criarTripulante: (dados) => post('/gerente/tripulantes', dados),
  editarTripulante: (cpf, dados) => put(`/gerente/tripulantes/${q(cpf)}`, dados),
  removerTripulante: (cpf) => del(`/gerente/tripulantes/${q(cpf)}`),
}

// rotas do administrador
export const admin = {
  // cada voo ja vem com a escala tecnica e os comissarios
  listarVoos: () => get('/admin/voos'),

  // horarios vao no formato do input datetime-local
  criarVoo: (dados) => post('/admin/voos', dados),

  // status pode ser programado atrasado cancelado ou concluido
  atualizarStatus: (numVoo, status) => patch(`/admin/voos/${q(numVoo)}/status`, { status }),
}
