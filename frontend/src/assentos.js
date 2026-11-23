// monta o mapa de assentos igual ao povoamento
// ate 20 lugares sao 2 por fileira e acima disso sao 6
export function gerarFileiras(capacidade) {
  const letras = capacidade <= 20 ? ['A', 'B'] : ['A', 'B', 'C', 'D', 'E', 'F']
  const fileiras = []
  let total = 0
  for (let fileira = 1; total < capacidade; fileira++) {
    const linha = []
    for (const letra of letras) {
      if (total >= capacidade) break
      linha.push(`${fileira}${letra}`)
      total++
    }
    fileiras.push(linha)
  }
  return fileiras
}
