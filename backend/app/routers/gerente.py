from datetime import date
from typing import Literal, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.database import get_db

router = APIRouter(prefix="/gerente", tags=["Gerente"])

#SCHEMAS 
class AeronaveCreate(BaseModel):
    id_aeronave: str
    modelo: str
    num_assentos: int
    cpf_gerente: str


class TrajetoCreate(BaseModel):
    num_trajeto: str
    origem: str
    destino: str
    aeroporto_origem: str
    aeroporto_destino: str
    cpf_gerente: str


class TripulanteCreate(BaseModel):
    cpf: str
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    data_de_nascimento: date
    num_credencial: str
    cpf_gerente: str
    tipo: Literal["tecnico", "comissario"]
    codigo_anac: Optional[str] = None  # Obrigatório se tipo == 'tecnico'

class AeronaveUpdate(BaseModel):
    modelo: str
    num_assentos: int


class TrajetoUpdate(BaseModel):
    origem: str
    destino: str
    aeroporto_origem: str
    aeroporto_destino: str


class TripulanteUpdate(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    data_de_nascimento: date
    num_credencial: str
    codigo_anac: Optional[str] = None  # Usado apenas se for Tripulante Técnico


#AERONAVES
@router.get("/aeronaves")
def listar_aeronaves():
    with get_db() as cur:
        cur.execute("SELECT * FROM AERONAVE ORDER BY ID_Aeronave")
        return cur.fetchall()


@router.post("/aeronaves", status_code=201)
def criar_aeronave(payload: AeronaveCreate):
    with get_db() as cur:
        cur.execute(
            """
            INSERT INTO AERONAVE (ID_Aeronave, Modelo, NumAssentos, CPF_Gerente)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (payload.id_aeronave, payload.modelo, payload.num_assentos, payload.cpf_gerente),
        )
        return cur.fetchone()


@router.delete("/aeronaves/{id_aeronave}")
def remover_aeronave(id_aeronave: str):
    with get_db() as cur:
        cur.execute("DELETE FROM AERONAVE WHERE ID_Aeronave = %s RETURNING ID_Aeronave", (id_aeronave,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Aeronave não encontrada.")
    return {"message": f"Aeronave {id_aeronave} removida."}

@router.put("/aeronaves/{id_aeronave}")
def atualizar_aeronave(id_aeronave: str, payload: AeronaveUpdate):
    with get_db() as cur:
        cur.execute(
            """
            UPDATE AERONAVE
               SET Modelo = %s,
                   NumAssentos = %s
             WHERE ID_Aeronave = %s
         RETURNING *
            """,
            (payload.modelo, payload.num_assentos, id_aeronave),
        )
        atualizada = cur.fetchone()
        if not atualizada:
            raise HTTPException(status_code=404, detail="Aeronave não encontrada.")
    return atualizada


#TRAJETOS
@router.get("/trajetos")
def listar_trajetos():
    with get_db() as cur:
        cur.execute("SELECT * FROM TRAJETO ORDER BY NumTrajeto")
        return cur.fetchall()


@router.post("/trajetos", status_code=201)
def criar_trajeto(payload: TrajetoCreate):
    with get_db() as cur:
        cur.execute(
            """
            INSERT INTO TRAJETO (NumTrajeto, AeroportoOrigem, AeroportoDestino, Origem, Destino, CPF_Gerente)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                payload.num_trajeto,
                payload.aeroporto_origem,
                payload.aeroporto_destino,
                payload.origem,
                payload.destino,
                payload.cpf_gerente,
            ),
        )
        return cur.fetchone()


@router.delete("/trajetos/{num_trajeto}")
def remover_trajeto(num_trajeto: str):
    with get_db() as cur:
        cur.execute("DELETE FROM TRAJETO WHERE NumTrajeto = %s RETURNING NumTrajeto", (num_trajeto,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Trajeto não encontrado.")
    return {"message": f"Trajeto {num_trajeto} removido."}

@router.put("/trajetos/{num_trajeto}")
def atualizar_trajeto(num_trajeto: str, payload: TrajetoUpdate):
    with get_db() as cur:
        cur.execute(
            """
            UPDATE TRAJETO
               SET Origem = %s,
                   Destino = %s,
                   AeroportoOrigem = %s,
                   AeroportoDestino = %s
             WHERE NumTrajeto = %s
         RETURNING *
            """,
            (
                payload.origem,
                payload.destino,
                payload.aeroporto_origem,
                payload.aeroporto_destino,
                num_trajeto,
            ),
        )
        atualizado = cur.fetchone()
        if not atualizado:
            raise HTTPException(status_code=404, detail="Trajeto não encontrado.")
    return atualizado

#TRIPULAÇÃO
@router.get("/tripulantes")
def listar_tripulantes():
    query = """
        SELECT
            u.CPF,
            u.Nome,
            u."E-mail" AS email,
            u.Telefone,
            u.DataDeNascimento,
            f.NumCredencial,
            t.HorasVoadasDia,
            t.FimUltimoDescanso,
            t.CPF_Gerente,
            tt.CodigoANAC,
            CASE
                WHEN tt.CPF IS NOT NULL THEN 'tecnico'
                ELSE 'comissario'
            END AS tipo
        FROM TRIPULANTE t
        JOIN FUNCIONARIO f ON f.CPF = t.CPF
        JOIN USUARIO u ON u.CPF = t.CPF
        LEFT JOIN TRIPULANTE_TECNICO tt ON tt.CPF = t.CPF
        ORDER BY u.Nome
    """
    with get_db() as cur:
        cur.execute(query)
        return cur.fetchall()


@router.post("/tripulantes", status_code=201)
def criar_tripulante(payload: TripulanteCreate):
    if payload.tipo == "tecnico" and not payload.codigo_anac:
        raise HTTPException(status_code=400, detail="Tripulante Técnico exige CodigoANAC.")

    with get_db() as cur:
        cur.execute(
            """
            INSERT INTO USUARIO (CPF, Nome, "E-mail", Telefone, DataDeNascimento)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (payload.cpf, payload.nome, payload.email, payload.telefone, payload.data_de_nascimento),
        )
        cur.execute(
            "INSERT INTO FUNCIONARIO (CPF, NumCredencial) VALUES (%s, %s)",
            (payload.cpf, payload.num_credencial),
        )
        cur.execute(
            """
            INSERT INTO TRIPULANTE (CPF, HorasVoadasDia, FimUltimoDescanso, CPF_Gerente)
            VALUES (%s, 0.00, NULL, %s)
            """,
            (payload.cpf, payload.cpf_gerente),
        )
        if payload.tipo == "tecnico":
            cur.execute(
                "INSERT INTO TRIPULANTE_TECNICO (CPF, CodigoANAC) VALUES (%s, %s)",
                (payload.cpf, payload.codigo_anac),
            )
        else:
            cur.execute("INSERT INTO COMISSARIO_BORDO (CPF) VALUES (%s)", (payload.cpf,))

    return {"message": f"Tripulante ({payload.tipo}) cadastrado com sucesso.", "cpf": payload.cpf}


@router.delete("/tripulantes/{cpf}")
def remover_tripulante(cpf: str):
    with get_db() as cur:
        #ON DELETE CASCADE REMOVE DAS SUBCLASSES AUTOMATICAMENTE
        cur.execute("DELETE FROM USUARIO WHERE CPF = %s RETURNING CPF", (cpf,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Tripulante não encontrado.")
    return {"message": f"Tripulante {cpf} removido."}

@router.put("/tripulantes/{cpf}")
def atualizar_tripulante(cpf: str, payload: TripulanteUpdate):
    with get_db() as cur:
        #GARANTE QUE O CPF INFORMADO REALMENTE PERTENCE A UM TRIPULANTE
        cur.execute("SELECT CPF FROM TRIPULANTE WHERE CPF = %s", (cpf,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Tripulante não encontrado.")

        cur.execute(
            """
            UPDATE USUARIO
               SET Nome = %s,
                   "E-mail" = %s,
                   Telefone = %s,
                   DataDeNascimento = %s
             WHERE CPF = %s
            """,
            (payload.nome, payload.email, payload.telefone, payload.data_de_nascimento, cpf),
        )

        cur.execute(
            """
            UPDATE FUNCIONARIO
               SET NumCredencial = %s
             WHERE CPF = %s
            """,
            (payload.num_credencial, cpf),
        )

        #SE FOR TRIPULANTE TECNICO E ENVIOU CodigoANAC, ATUALIZA TAMBEM
        if payload.codigo_anac is not None:
            cur.execute(
                """
                UPDATE TRIPULANTE_TECNICO
                   SET CodigoANAC = %s
                 WHERE CPF = %s
                """,
                (payload.codigo_anac, cpf),
            )

    return {"message": f"Tripulante {cpf} atualizado com sucesso."}