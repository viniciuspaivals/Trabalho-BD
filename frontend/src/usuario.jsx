// guarda o usuario logado no localstorage pra todas as telas usarem
import { createContext, useContext, useState } from 'react'

const UsuarioContext = createContext(null)
const CHAVE = 'decolae_usuario'

function lerSalvo() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSalvo)

  // dados do login junto com o papel escolhido
  function entrar(dados) {
    setUsuario(dados)
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)) } catch { /* sem localstorage */ }
  }

  function sair() {
    setUsuario(null)
    try { localStorage.removeItem(CHAVE) } catch { /* sem localstorage */ }
  }

  return (
    <UsuarioContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </UsuarioContext.Provider>
  )
}

export function useUsuario() {
  return useContext(UsuarioContext)
}

// pra onde cada perfil vai depois do login
export const INICIO_POR_PAPEL = {
  cliente: '/cliente/voos',
  gerente: '/gerente/aeronaves',
  administrador: '/admin/voos',
}
