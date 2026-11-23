import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function Voos() {
  return (
    <EmConstrucao
      titulo="Voos (administrador)"
      arquivo="src/pages/admin/Voos.jsx"
      itens={[
        'Listar: admin.listarVoos() → inclui voos cancelados e a tripulação de cada voo.',
        'Mostrar: nº do voo, trajeto, data/hora, aeronave, assentos livres, status e tripulação (escala_tecnica e escala_comissarios).',
        'Status com cores: Programado (azul), Atrasado (amarelo), Cancelado (vermelho), Concluído (verde).',
        'Mudar status: um <select> que chama admin.atualizarStatus(numVoo, novoStatus) e recarrega a lista.',
        'Botão "Novo voo" levando para /admin/voos/novo.',
      ]}
    />
  )
}
