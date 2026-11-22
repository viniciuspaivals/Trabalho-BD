import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://127.0.0.1:8000"


def post_json(endpoint: str, payload: dict):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, {"detail": body}


def teste_rn07_mesmo_assento():
    print("\n=== TESTE 1: RN07 (2 clientes disputando o mesmo assento no VOO-1001) ===")
    pedidos = [
        {
            "cpf_cliente": "11111111111",
            "forma_pagamento": "PIX",
            "num_voo": "VOO-1001",
            "nome_tipo": "Econômica",
            "numero_assento": "15A",
        },
        {
            "cpf_cliente": "22222222222",
            "forma_pagamento": "Cartão de Crédito",
            "num_voo": "VOO-1001",
            "nome_tipo": "Econômica",
            "numero_assento": "15A",
        },
    ]

    with ThreadPoolExecutor(max_workers=2) as executor:
        resultados = list(executor.map(lambda p: post_json("/cliente/compras", p), pedidos))

    for i, (status, body) in enumerate(resultados, start=1):
        print(f"Requisição {i} -> HTTP {status}: {body}")


def teste_rn08_capacidade_maxima():
    print("\n=== TESTE 2: RN08 (5 compras simultâneas em aeronave de 1 assento - SELECT FOR UPDATE) ===")

    # 1. Cadastra aeronave com apenas 1 assento (ignora se já existir)
    post_json(
        "/gerente/aeronaves",
        {
            "id_aeronave": "PR-LOCK1",
            "modelo": "Cessna Teste Lock",
            "num_assentos": 1,
            "cpf_gerente": "33333333333",
        },
    )

    # 2. Cria voo futuro sem conflito de horário com VOO-1001
    post_json(
        "/admin/voos",
        {
            "num_voo": "VOO-LOCK1",
            "data_voo": "2026-12-20",
            "status": "Programado",
            "horario_previsto_partida": "2026-12-20T10:00:00",
            "horario_previsto_chegada": "2026-12-20T11:20:00",
            "valor_base": 500.00,
            "cpf_administrador": "44444444444",
            "num_aeronave": "PR-LOCK1",
            "num_trajeto": "TRJ-CNF-GRU",
            "cpf_piloto": "55555555555",
            "cpf_copiloto": "66666666666",
            "cpfs_comissarios": ["77777777777", "88888888888"],
        },
    )

    # 3. Dispara 5 compras simultâneas em assentos diferentes (1A..1E)
    assentos = ["1A", "1B", "1C", "1D", "1E"]
    pedidos = [
        {
            "cpf_cliente": "11111111111" if idx % 2 == 0 else "22222222222",
            "forma_pagamento": "PIX",
            "num_voo": "VOO-LOCK1",
            "nome_tipo": "Econômica",
            "numero_assento": assento,
        }
        for idx, assento in enumerate(assentos)
    ]

    with ThreadPoolExecutor(max_workers=5) as executor:
        resultados = list(executor.map(lambda p: post_json("/cliente/compras", p), pedidos))

    sucessos = sum(1 for status, _ in resultados if status == 201)
    for assento, (status, body) in zip(assentos, resultados):
        print(f"Assento {assento} -> HTTP {status}: {body}")

    print(f"\nResultado RN08: {sucessos} compra(s) confirmada(s) de 5 tentativas (esperado: 1).")


if __name__ == "__main__":
    teste_rn07_mesmo_assento()
    teste_rn08_capacidade_maxima()