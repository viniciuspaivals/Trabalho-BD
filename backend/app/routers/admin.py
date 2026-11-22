from datetime import date, datetime
from typing import List, Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["Administrador"])

class VooCreate(BaseModel):
    num_voo: str
    data_voo: date
    status: Literal["Programado", "Atrasado", "Cancelado", "Concluído"] = "Programado"
    horario_previsto_partida: datetime
    horario_previsto_chegada: datetime
    valor_base: float
    cpf_administrador: str
    num_aeronave: str
    num_trajeto: str
    cpf_piloto: str
    cpf_copiloto: str
    cpfs_comissarios: List[str]

class StatusVooUpdate(BaseModel):
    status: Literal["Programado", "Atrasado", "Cancelado", "Concluído"]

@router.get("/voos")
def listar_voos_admin():
    with get_db() as cur:
        cur.execute("SELECT * FROM vw_voos_disponiveis ORDER BY HorarioPrevistoPartida")
        voos = cur.fetchall()

        for voo in voos:
            num_voo = voo["numvoo"]

            cur.execute(
                """
                SELECT et.CPFTripulanteTecnico AS cpf, u.Nome AS nome, et.FuncaoVoo AS funcao
                FROM ESCALA_TECNICA et
                JOIN USUARIO u ON u.CPF = et.CPFTripulanteTecnico
                WHERE et.NumVoo = %s
                """,
                (num_voo,),
            )
            voo["escala_tecnica"] = cur.fetchall()

            cur.execute(
                """
                SELECT ec.CPFComissario AS cpf, u.Nome AS nome
                FROM ESCALA_COMISSARIO ec
                JOIN USUARIO u ON u.CPF = ec.CPFComissario
                WHERE ec.NumVoo = %s
                """,
                (num_voo,),
            )
            voo["escala_comissarios"] = cur.fetchall()

    return voos

@router.post("/voos", status_code=201)
def criar_voo(payload: VooCreate):
    with get_db() as cur:
        #INSERE O VOO
        cur.execute(
            """
            INSERT INTO VOO (
                NumVoo, DataVoo, Status, HorarioPrevistoPartida, HorarioPrevistoChegada,
                ValorBase, CPFAdministrador, NumAeronave, NumTrajeto
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                payload.num_voo,
                payload.data_voo,
                payload.status,
                payload.horario_previsto_partida,
                payload.horario_previsto_chegada,
                payload.valor_base,
                payload.cpf_administrador,
                payload.num_aeronave,
                payload.num_trajeto,
            ),
        )

        #INSERE ESCALA TECNICA
        cur.execute(
            """
            INSERT INTO ESCALA_TECNICA (CPFTripulanteTecnico, NumVoo, FuncaoVoo)
            VALUES (%s, %s, 'Piloto'), (%s, %s, 'Copiloto')
            """,
            (payload.cpf_piloto, payload.num_voo, payload.cpf_copiloto, payload.num_voo),
        )

        #INSERE ESCALA DE COMISSSARIOS
        for cpf_com in payload.cpfs_comissarios:
            cur.execute(
                """
                INSERT INTO ESCALA_COMISSARIO (CPFComissario, NumVoo)
                VALUES (%s, %s)
                """,
                (cpf_com, payload.num_voo),
            )
        #AO SAIR DO BLOCO, O COMMIT DISPARA O CONSTRAINT TRIGGER

    return {"message": f"Voo {payload.num_voo} criado e tripulação escalada com sucesso."}

@router.patch("/voos/{num_voo}/status")
def atualizar_status_voo(num_voo : str, payload: StatusVooUpdate):
    with get_db() as cur:
        cur.execute(
            "UPDATE VOO SET Status = %s WHERE NumVoo = %s RETURNING NumVoo, Status",
            (payload.status, num_voo),
        )
        atualizado - cur.fetchone()
        if not atualizado:
            raise HTTPException(status_code=404, detail="Voo não encontrado.")
    return atualizado    