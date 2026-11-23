import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function Aeronaves() {
  return (
    <EmConstrucao
      titulo="Gerenciar aeronaves"
      arquivo="src/pages/gerente/Aeronaves.jsx"
      itens={[
        'Listar: gerente.listarAeronaves() → tabela com ID, modelo e nº de assentos.',
        'Criar: formulário → gerente.criarAeronave({ id_aeronave, modelo, num_assentos, cpf_gerente: usuario.cpf }).',
        'Editar: gerente.editarAeronave(id, { modelo, num_assentos }).',
        'Remover: gerente.removerAeronave(id) (perguntar antes com window.confirm).',
        'Depois de criar/editar/remover, chamar a listagem de novo para atualizar a tabela.',
        'Erros do banco (ex.: aeronave usada em um voo não pode ser removida) aparecem com <Mensagem />.',
      ]}
    />
  )
}
