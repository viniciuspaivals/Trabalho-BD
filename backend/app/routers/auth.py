from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Autenticação"])

class LoginRequest(BaseModel):
    identificador: str #CPF, EMAIL OU NumCredencial

class CadastroClienteRequest(BaseModel):
    cpf:str
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    data_de_nascimento:date

@router.post("/login")
def login(payload: LoginRequest):
    ident = payload.identificador.strip()
    query = """
        SELECT
            u.CPF,
            u.Nome,
            u."E-mail" AS email,
            u.Telefone,
            u.DataDeNascimento,
            f.NumCredencial,
            (c.CPF IS NOT NULL) AS is_cliente,
            (g.CPF IS NOT NULL) AS is_gerente,
            (a.CPF IS NOT NULL) AS is_administrador,
            (t.CPF IS NOT NULL) AS is_tripulante
        FROM USUARIO u
        LEFT JOIN CLIENTE c ON c.CPF = u.CPF
        LEFT JOIN FUNCIONARIO f ON f.CPF = u.CPF
        LEFT JOIN GERENTE g ON g.CPF = u.CPF
        LEFT JOIN ADMINISTRADOR a ON a.CPF = u.CPF
        LEFT JOIN TRIPULANTE t ON t.CPF = u.CPF
        WHERE u.CPF = %s OR LOWER(u."E-mail") = LOWER(%s) OR LOWER(f.NumCredencial) = LOWER(%s)
    """
    with get_db() as cur:
        cur.execute(query, (ident, ident, ident))
        user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    papeis = []
    if user["is_gerente"]: papeis.append("gerente")
    if user["is_administrador"]: papeis.append("administrador")
    if user ["is_tripulante"]: papeis.append("tripulante")
    if user["is_cliente"]: papeis.append("cliente")

    return {
        "cpf": user["cpf"],
        "nome": user["nome"],
        "email": user["email"],
        "telefone": user["telefone"],
        "num_credencial": user["numcredencial"],
        "papeis": papeis,
    }

@router.post("/register", status_code=201)
def registrar_cliente(payload: CadastroClienteRequest):
    with get_db() as cur:
        cur.execute(
            """
            INSERT INTO USUARIO (CPF, Nome, "E-mail", Telefone, DataDeNascimento)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (payload.cpf, payload.nome, payload.email, payload.telefone, payload.data_de_nascimento),
        )
        cur.execute("INSERT INTO CLIENTE (CPF) VALUES (%s)", (payload.cpf,))
    return {"message": "Cliente cadastrado com sucesso.", "cpf": payload.cpf}