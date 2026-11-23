// pagina provisoria mostrando o que falta fazer em cada tela
export default function EmConstrucao({ titulo, arquivo, itens = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
          Em construção
        </span>
        <h1 className="text-xl font-bold mt-3">{titulo}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Arquivo: <code className="font-mono text-sky-700">{arquivo}</code>
        </p>
      </div>
      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
