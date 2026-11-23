import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function Trajetos() {
  return (
    <EmConstrucao
      titulo="Gerenciar trajetos"
      arquivo="src/pages/gerente/Trajetos.jsx"
      itens={[
        'Mesmo padrão da tela de Aeronaves (dá para copiar e adaptar).',
        'Listar: gerente.listarTrajetos().',
        'Criar: gerente.criarTrajeto({ num_trajeto, origem, destino, aeroporto_origem, aeroporto_destino, cpf_gerente: usuario.cpf }).',
        'Editar: gerente.editarTrajeto(num, { origem, destino, aeroporto_origem, aeroporto_destino }).',
        'Remover: gerente.removerTrajeto(num).',
        'Lembrete do enunciado: só voos domésticos (origem e destino no Brasil).',
      ]}
    />
  )
}
