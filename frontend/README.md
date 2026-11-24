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

## Telas

| Perfil | Tela | O que faz |
|---|---|---|
| Todos | Login | entra com CPF, e-mail ou nº de credencial |
| Todos | Cadastro | cria conta de cliente |
| Cliente | Buscar voos | lista os voos disponíveis com filtro de origem, destino e data |
| Cliente | Assentos | mapa de assentos, tipo de passagem, pagamento e compra |
| Cliente | Minhas compras | reservas do cliente com as passagens de cada uma |
| Gerente | Aeronaves | cadastrar, editar e remover aeronaves |
| Gerente | Trajetos | cadastrar, editar e remover trajetos |
| Gerente | Tripulantes | cadastrar, editar e remover técnicos e comissários |
| Administrador | Voos | todos os voos com a tripulação e troca de status |
| Administrador | Novo voo | cria o voo e escala piloto, copiloto e comissários |

## Estrutura

```
frontend/src/
├── api.js            # todas as chamadas à API (auth, cliente, gerente, admin)
├── usuario.jsx       # usuário logado (useUsuario)
├── formatar.js       # datas e valores no padrão brasileiro
├── assentos.js       # monta o mapa de assentos a partir da capacidade
├── App.jsx           # rotas
├── components/
│   ├── Navbar.jsx        # barra de cima, o menu muda conforme o perfil
│   ├── RotaProtegida.jsx # só deixa entrar quem tem o perfil certo
│   ├── Mensagem.jsx      # caixa de erro e sucesso
│   └── Carregando.jsx
└── pages/
    ├── Login.jsx
    ├── Cadastro.jsx
    ├── cliente/   Voos.jsx, Assentos.jsx, MinhasCompras.jsx
    ├── gerente/   Aeronaves.jsx, Trajetos.jsx, Tripulantes.jsx
    └── admin/     Voos.jsx, NovoVoo.jsx
```

## Regras combinadas

- As telas não usam `fetch` direto, sempre as funções do `api.js`.
- Erros da API aparecem com `<Mensagem />`. As mensagens das regras (RN08, RN11...) já vêm prontas do banco.
- O CPF de quem está logado (`cpf_gerente`, `cpf_administrador`, `cpf_cliente`) vem de `useUsuario()`.
- Visual: caixas brancas com borda fina, sem arredondamento e sem sombra, azul `blue-800` nos botões e `blue-900` no fundo do login e na barra de cima.

## Convenção dos assentos

A API devolve só a capacidade e a lista de assentos ocupados. O mapa é montado com `gerarFileiras(capacidade)` (`src/assentos.js`):
- aeronave com **até 20 lugares**: 2 por fileira (1A, 1B, 2A, 2B…)
- aeronave **maior**: 6 por fileira (1A a 1F, 2A a 2F…)

O povoamento segue essa regra.
