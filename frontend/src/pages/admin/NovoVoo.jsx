import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function NovoVoo() {
  return (
    <EmConstrucao
      titulo="Cadastrar novo voo"
      arquivo="src/pages/admin/NovoVoo.jsx"
      itens={[
        'Carregar as opções dos selects: gerente.listarTrajetos(), gerente.listarAeronaves() e gerente.listarTripulantes().',
        'Separar os tripulantes: técnicos (piloto e copiloto) e comissários (marcar 2 ou mais com checkbox).',
        'Campos: nº do voo, trajeto, aeronave, partida e chegada (<input type="datetime-local">), valor base.',
        'data_voo = os 10 primeiros caracteres da partida (AAAA-MM-DD).',
        'Enviar: admin.criarVoo({ num_voo, data_voo, horario_previsto_partida, horario_previsto_chegada, valor_base, cpf_administrador: usuario.cpf, num_aeronave, num_trajeto, cpf_piloto, cpf_copiloto, cpfs_comissarios }).',
        'Os erros das regras vêm prontos do banco: RN09/RN10 (tripulação mínima), RN11 (conflito de aeronave), RN12/RN13 (escala e descanso). Mostrar com <Mensagem />.',
        'Sucesso: voltar para a lista de voos.',
      ]}
    />
  )
}
