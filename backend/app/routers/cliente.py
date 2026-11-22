import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/cliente", tags=["Cliente"])

class CompraCreate(BaseModel):
    cpf_cliente: str
    forma_pagamento: str
    num_voo: str
    nome_tipo: str
    numero_assento: str

@router.get("/voos")
def buscar_voos_disponiveis(
    origem: Optional[str] = None,
    destino: Optional[str] = None,
    data_voo: Optional[date] = None,
):
    query = """
        SELECT * FROM vw_voos_disponiveis
        WHERE AssentosDisponiveis > 0
          AND Status <> 'Cancelado'
    """
    params = []

    if origem:
        query += " AND (Origem ILIKE %s OR AeroportoOrigem ILIKE %s)"
        params.extend([f"%{origem}%", f"%{origem}%"])
    if destino:
        query += " AND (Destino ILIKE %s OR AeroportoDestino ILIKE %s)"
        params.extend([f"%{destino}%", f"%{destino}%"])
    if data_voo:
        query += " AND DataVoo = %s"
        params.append(data_voo)

    query += " ORDER BY HorarioPrevistoPartida"

    with get_db() as cur:
        cur.execute(query, params)
        return cur.fetchall()

@router.get("/voos/{num_voo}/assentos")
def listar_assentos_voo(num_voo: str):
    with get_db() as cur:
        cur.execute(
            """
            SELECT v.NumVoo, a.ID_Aeronave, a.Modelo, a.NumAssentos
            FROM VOO v
            JOIN AERONAVE a ON a.ID_Aeronave = v.NumAeronave
            WHERE v.NumVoo = %s
            """,
            (num_voo,),
        )
        voo = cur.fetchone()
        if not voo:
            raise HTTPException(status_code=404, detail="Voo não encontrado.")

        cur.execute(
            "SELECT NumeroAssento FROM CARTAO_EMBARQUE WHERE NumVoo = %s",
            (num_voo,),
        )
        ocupados = [row["numeroassento"] for row in cur.fetchall()]

    return {
        "num_voo": voo["numvoo"],
        "aeronave": f"{voo['id_aeronave']} ({voo['modelo']})",
        "capacidade": voo["numassentos"],
        "assentos_ocupados": ocupados,
    }

@router.get("/tipos-passagem")
def listar_tipos_passagem():
    with get_db() as cur:
        cur.execute("SELECT NomeTipo, Multiplicador FROM TIPO_PASSAGEM ORDER BY Multiplicador")
        return cur.fetchall()

@router.post("/compras", status_code=201)
def realizar_compra(payload: CompraCreate):
    sufixo = uuid.uuid4().hex[:6].upper()
    codigo_reserva = f"RES-{sufixo}"
    num_passagem = f"PAS-{sufixo}"
    num_embarque = f"EMB-{sufixo}"

    with get_db() as cur:
        cur.execute(
            """
            SELECT fn_realizar_compra(%s, %s, %s, %s, %s, %s, %s, %s) AS valor_pago
            """,
            (
                codigo_reserva,
                payload.cpf_cliente,
                payload.forma_pagamento,
                num_passagem,
                num_embarque,
                payload.num_voo,
                payload.nome_tipo,
                payload.numero_assento,
            ),
        )
        resultado = cur.fetchone()

    return {
        "message": "Compra confirmada e cartão de embarque emitido.",
        "codigo_reserva": codigo_reserva,
        "num_passagem": num_passagem,
        "num_embarque": num_embarque,
        "valor_pago": float(resultado["valor_pago"]),
    }


@router.get("/{cpf}/compras")
def historico_compras_cliente(cpf: str):
    query = """
        SELECT
            c.CodigoReserva,
            c.StatusCompra,
            c.FormaPagamento,
            p.NumPassagem,
            p.ValorPago,
            p.StatusPassagem,
            p.NomeTipo,
            tp.Multiplicador,
            ce.NumEmbarque,
            ce.NumeroAssento,
            ce.StatusEmbarque,
            v.NumVoo,
            v.DataVoo,
            v.HorarioPrevistoPartida,
            v.HorarioPrevistoChegada,
            t.Origem,
            t.Destino,
            t.AeroportoOrigem,
            t.AeroportoDestino,
            u.Nome AS NomePassageiro
        FROM COMPRA c
        JOIN USUARIO u ON u.CPF = c.CPFCliente
        JOIN PASSAGEM p ON p.CodigoReserva = c.CodigoReserva
        JOIN TIPO_PASSAGEM tp ON tp.NomeTipo = p.NomeTipo
        JOIN CARTAO_EMBARQUE ce ON ce.NumPassagem = p.NumPassagem
        JOIN VOO v ON v.NumVoo = ce.NumVoo
        JOIN TRAJETO t ON t.NumTrajeto = v.NumTrajeto
        WHERE c.CPFCliente = %s
        ORDER BY v.HorarioPrevistoPartida DESC, c.CodigoReserva DESC
    """
    with get_db() as cur:
        cur.execute(query, (cpf,))
        return cur.fetchall()