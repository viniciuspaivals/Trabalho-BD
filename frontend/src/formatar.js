// formata data hora e dinheiro no padrao brasileiro

export function data(valor) {
  if (!valor) return '-'
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function hora(valor) {
  if (!valor) return '-'
  return String(valor).slice(11, 16)
}

export function dataHora(valor) {
  return `${data(valor)} ${hora(valor)}`
}

export function dinheiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// tempo de voo tipo 1h20
export function duracao(partida, chegada) {
  const min = Math.round((new Date(chegada) - new Date(partida)) / 60000)
  if (!Number.isFinite(min) || min <= 0) return '-'
  const h = Math.floor(min / 60)
  const m = String(min % 60).padStart(2, '0')
  return `${h}h${m}`
}
