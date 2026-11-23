# Decolaê – Front-end (React)

Telas do sistema Decolaê, feitas em **React + Vite + Tailwind**. O front conversa com a API em FastAPI (pasta `backend/`).

## Como rodar

Pré-requisitos: **Node.js 18+** instalado, e a **API rodando** (`uvicorn app.main:app --reload` dentro de `backend/`).

```bash
cd frontend
npm install        # só na primeira vez
npm run dev
```

Abra **http://localhost:5173**. Na tela de login há botões de **acesso rápido** (Cliente, Gerente, Administrador) com os usuários do povoamento.

> Se a API estiver em outro endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

## Estrutura

```
frontend/src/
├── api.js            # TODAS as chamadas à API (auth, cliente, gerente, admin)
├── usuario.jsx       # usuário logado: const { usuario } = useUsuario()
├── formatar.js       # datas e valores no padrão brasileiro
├── assentos.js       # monta o mapa de assentos a partir da capacidade
├── App.jsx           # rotas (qual endereço abre qual tela)
├── components/
│   ├── Navbar.jsx        # barra de cima (menu muda conforme o perfil)
│   ├── RotaProtegida.jsx # só deixa entrar quem tem o perfil certo
│   ├── Mensagem.jsx      # caixa de erro/sucesso
│   ├── Carregando.jsx
│   └── EmConstrucao.jsx  # página provisória com a lista do que falta
└── pages/
    ├── Login.jsx              ✅ pronto
    ├── Cadastro.jsx           ⏳ a fazer
    ├── cliente/
    │   ├── Voos.jsx           ✅ pronto (TELA DE EXEMPLO)
    │   ├── Assentos.jsx       ⏳ a fazer
    │   └── MinhasCompras.jsx  ⏳ a fazer
    ├── gerente/
    │   ├── Aeronaves.jsx      ⏳ a fazer
    │   ├── Trajetos.jsx       ⏳ a fazer
    │   └── Tripulantes.jsx    ⏳ a fazer
    └── admin/
        ├── Voos.jsx           ⏳ a fazer
        └── NovoVoo.jsx        ⏳ a fazer
```

Cada tela "a fazer" já abre no sistema e mostra **a lista do que precisa ser implementado** e quais funções do `api.js` usar.

## Como fazer uma tela nova

Use `pages/cliente/Voos.jsx` como modelo. O padrão é sempre o mesmo:

```jsx
import { useEffect, useState } from 'react'
import { gerente } from '../../api.js'
import { useUsuario } from '../../usuario.jsx'
import Mensagem from '../../components/Mensagem.jsx'

export default function Aeronaves() {
  const { usuario } = useUsuario()          // usuario.cpf, usuario.nome
  const [lista, setLista] = useState([])
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      setLista(await gerente.listarAeronaves())
    } catch (e) {
      setErro(e.message)                     // mensagem que veio do banco/trigger
    }
  }

  useEffect(() => { carregar() }, [])

  return (
    <div>
      <Mensagem texto={erro} />
      {/* tabela, formulário... */}
    </div>
  )
}
```

**Regras combinadas:**
- Nunca usar `fetch` direto nas telas: sempre as funções do `api.js`.
- Erros da API sempre aparecem com `<Mensagem />` — as mensagens das regras (RN08, RN11...) já vêm prontas do banco.
- O CPF de quem está logado (para `cpf_gerente`, `cpf_administrador`, `cpf_cliente`) vem de `useUsuario()`.
- Visual: mesmo estilo do protótipo (Tailwind, cartões brancos `rounded-2xl`, botões `bg-sky-600`).

## Convenção dos assentos

A API devolve só a capacidade e a lista de assentos ocupados; o mapa é montado com `gerarFileiras(capacidade)` (`src/assentos.js`):
- aeronave com **até 20 lugares**: 2 por fileira (1A, 1B, 2A, 2B…);
- aeronave **maior**: 6 por fileira (1A a 1F, 2A a 2F…).

O povoamento segue essa regra.
