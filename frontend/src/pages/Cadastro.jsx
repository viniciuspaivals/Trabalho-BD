import { Link } from 'react-router-dom'
import EmConstrucao from '../components/EmConstrucao.jsx'

export default function Cadastro() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-blue-900">
      <div className="w-full max-w-lg space-y-4">
        <EmConstrucao
          titulo="Cadastro de cliente"
          arquivo="src/pages/Cadastro.jsx"
          itens={[
            'Formulário: CPF, nome, e-mail, telefone e data de nascimento (<input type="date">).',
            'Enviar com auth.cadastrarCliente({ cpf, nome, email, telefone, data_de_nascimento }).',
            'Se der certo: mostrar mensagem de sucesso e voltar para o login.',
            'Se der erro (ex.: CPF ou e-mail repetido): mostrar a mensagem com <Mensagem />.',
          ]}
        />
        <Link to="/login" className="block text-center text-sky-200 font-semibold hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
