import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function MinhasCompras() {
  return (
    <EmConstrucao
      titulo="Minhas compras"
      arquivo="src/pages/cliente/MinhasCompras.jsx"
      itens={[
        'Pegar o usuário logado: const { usuario } = useUsuario() (de src/usuario.jsx).',
        'Buscar: cliente.minhasCompras(usuario.cpf).',
        'Mostrar uma tabela ou cartões: reserva, voo, origem → destino, data/hora, assento, tipo, valor pago, status.',
        'Usar as funções de src/formatar.js para datas e valores (formatar.dataHora, formatar.dinheiro).',
        'Dica: uma mesma reserva pode ter mais de uma passagem (ex.: Gustavo, RES-G7H8I9).',
      ]}
    />
  )
}
