import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function Tripulantes() {
  return (
    <EmConstrucao
      titulo="Gerenciar tripulantes"
      arquivo="src/pages/gerente/Tripulantes.jsx"
      itens={[
        'Listar: gerente.listarTripulantes() → cada um vem com tipo "tecnico" ou "comissario".',
        'Mostrar o tipo como etiqueta (Técnico / Comissário) e o código ANAC dos técnicos.',
        'Criar: gerente.criarTripulante({ cpf, nome, email, telefone, data_de_nascimento, num_credencial, cpf_gerente: usuario.cpf, tipo, codigo_anac }).',
        'O campo código ANAC só aparece (e é obrigatório) quando o tipo for "tecnico".',
        'Editar: gerente.editarTripulante(cpf, { nome, email, telefone, data_de_nascimento, num_credencial, codigo_anac }).',
        'Remover: gerente.removerTripulante(cpf).',
      ]}
    />
  )
}
