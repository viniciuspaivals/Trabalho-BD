import { useParams } from 'react-router-dom'
import EmConstrucao from '../../components/EmConstrucao.jsx'

export default function Assentos() {
  const { numVoo } = useParams() // numero do voo que vem da url
  return (
    <EmConstrucao
      titulo={`Escolher assento e comprar — ${numVoo}`}
      arquivo="src/pages/cliente/Assentos.jsx"
      itens={[
        'Buscar o mapa: cliente.assentosDoVoo(numVoo) → { capacidade, assentos_ocupados, aeronave }.',
        'Montar as fileiras com gerarFileiras(capacidade) do arquivo src/assentos.js.',
        'Desenhar cada assento como botão: ocupado (cinza, desabilitado), livre, selecionado (azul).',
        'Buscar os tipos com cliente.tiposPassagem() e mostrar o preço: valor base do voo × multiplicador.',
        'Escolher a forma de pagamento (PIX, Cartão de Crédito, Boleto).',
        'Comprar: cliente.comprar({ cpf_cliente: usuario.cpf, forma_pagamento, num_voo, nome_tipo, numero_assento }).',
        'Sucesso: mostrar código da reserva e valor pago; erro (assento ocupado / voo lotado): mostrar a mensagem e recarregar o mapa.',
        'Dica: o VOO-1008 (Cessna, 9 lugares) só tem o assento 5A livre — bom para testar a regra de capacidade.',
      ]}
    />
  )
}
