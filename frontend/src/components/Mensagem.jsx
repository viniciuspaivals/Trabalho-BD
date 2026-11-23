// caixa pra mostrar erro dos triggers ou mensagem de sucesso
export default function Mensagem({ tipo = 'erro', texto, aoFechar }) {
  if (!texto) return null
  const estilo =
    tipo === 'sucesso'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
      : 'bg-red-50 border-red-300 text-red-800'

  return (
    <div role="alert" className={`flex items-start justify-between gap-3 border px-4 py-3 text-sm ${estilo}`}>
      <span>{texto}</span>
      {aoFechar && (
        <button onClick={aoFechar} className="font-bold opacity-60 hover:opacity-100" aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  )
}
