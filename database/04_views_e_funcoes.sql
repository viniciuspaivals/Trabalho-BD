-- COMPOSICAO MINIMA DA TRIPULACAO
CREATE OR REPLACE FUNCTION fn_validar_composicao_minima_voo()
RETURNS TRIGGER AS $$
DECLARE
    v_pilotos INT;
    v_copilotos INT;
    v_comissarios INT;
BEGIN
    -- SO VALIDA VOOS QUE NAO ESTEJAM CANCELADOS
    IF NEW.Status = 'Cancelado' THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO v_pilotos
      FROM ESCALA_TECNICA
    WHERE NumVoo = NEW.NumVoo AND FuncaoVoo = 'Piloto';

    SELECT COUNT(*) INTO v_copilotos
      FROM ESCALA_TECNICA
     WHERE NumVoo = NEW.NumVoo AND FuncaoVoo = 'Copiloto';

    SELECT COUNT(*) INTO v_comissarios
      FROM ESCALA_COMISSARIO
     WHERE NumVoo = NEW.NumVoo;

    IF v_pilotos < 1 OR v_copilotos < 1 THEN
        RAISE EXCEPTION 'RN09: O voo % deve possuir no mínimo 1 Piloto e 1 Copiloto (atual: % piloto(s), % copiloto(s)).',
            NEW.NumVoo, v_pilotos, v_copilotos;
    END IF;

    IF v_comissarios < 2 THEN
        RAISE EXCEPTION 'RN10: O voo % deve possuir no mínimo 2 Comissários de Bordo (atual: %).',
            NEW.NumVoo, v_comissarios;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_validar_composicao_minima_voo
AFTER INSERT OR UPDATE ON VOO
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_validar_composicao_minima_voo();

-- DISJUNCAO DE TRIPULANTE (TECNICO vs COMISSARIO DE BORDO)
CREATE OR REPLACE FUNCTION fn_validar_disjuncao_tripulante()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'tripulante_tecnico' AND EXISTS (SELECT 1 FROM COMISSARIO_BORDO WHERE CPF = NEW.CPF) THEN
        RAISE EXCEPTION 'Especialização disjunta: o tripulante % já é Comissário de Bordo.', NEW.CPF;
    END IF;

    IF TG_TABLE_NAME = 'comissario_bordo' AND EXISTS (SELECT 1 FROM TRIPULANTE_TECNICO WHERE CPF = NEW.CPF) THEN
        RAISE EXCEPTION 'Especialização disjunta: o tripulante % já é Tripulante Técnico.', NEW.CPF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_disjuncao_tripulante_tecnico
BEFORE INSERT ON TRIPULANTE_TECNICO
FOR EACH ROW EXECUTE FUNCTION fn_validar_disjuncao_tripulante();

CREATE TRIGGER trg_disjuncao_comissario_bordo
BEFORE INSERT ON COMISSARIO_BORDO
FOR EACH ROW EXECUTE FUNCTION fn_validar_disjuncao_tripulante();

-- VIEWS: ATRIBUTOS DERIVADOS (AssentosDisponiveis e ValorCompra)
CREATE OR REPLACE VIEW vw_voos_disponiveis AS
SELECT
    v.NumVoo,
    v.DataVoo,
    v.Status,
    v.HorarioPrevistoPartida,
    v.HorarioPrevistoChegada,
    v.ValorBase,
    v.NumAeronave,
    a.Modelo AS ModeloAeronave,
    a.NumAssentos AS CapacidadeTotal,
    (a.NumAssentos - COUNT(ce.NumEmbarque)) AS AssentosDisponiveis,
    v.NumTrajeto,
    t.Origem,
    t.Destino,
    t.AeroportoOrigem,
    t.AeroportoDestino
FROM VOO v
JOIN AERONAVE a ON a.ID_Aeronave = v.NumAeronave
JOIN TRAJETO t ON t.NumTrajeto = v.NumTrajeto
LEFT JOIN CARTAO_EMBARQUE ce ON ce.NumVoo = v.NumVoo
GROUP BY v.NumVoo, a.ID_Aeronave, t.NumTrajeto;

CREATE OR REPLACE VIEW vw_compras_resumo AS
SELECT
    c.CodigoReserva,
    c.CPFCliente,
    u.Nome AS NomeCliente,
    c.StatusCompra,
    c.FormaPagamento,
    COALESCE(SUM(p.ValorPago), 0.00) AS ValorCompra,
    COUNT(p.NumPassagem) AS QtdPassagens
FROM COMPRA c
JOIN USUARIO u ON u.CPF = c.CPFCliente
LEFT JOIN PASSAGEM p ON p.CodigoReserva = c.CodigoReserva
GROUP BY c.CodigoReserva, u.Nome;

-- FUNCAO TRANSACIONAL DE COMPRA NO BANCO
CREATE OR REPLACE FUNCTION fn_realizar_compra(
    p_codigo_reserva VARCHAR(20),
    p_cpf_cliente VARCHAR(11),
    p_forma_pagamento VARCHAR(50),
    p_num_passagem VARCHAR(20),
    p_num_embarque VARCHAR(20),
    p_num_voo VARCHAR(20),
    p_nome_tipo VARCHAR(50),
    p_numero_assento VARCHAR(10)
)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    v_valor_base NUMERIC(10,2);
    v_multiplicador NUMERIC(5,2);
    v_valor_final NUMERIC(10,2);
BEGIN
    SELECT ValorBase INTO v_valor_base FROM VOO WHERE NumVoo = p_num_voo;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voo % não encontrado.', p_num_voo;
    END IF;

    SELECT Multiplicador INTO v_multiplicador FROM TIPO_PASSAGEM WHERE NomeTipo = p_nome_tipo;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tipo de passagem % não encontrado.', p_nome_tipo;
    END IF;

    -- ValorBase * MULTIPLICADOR
    v_valor_final := ROUND(v_valor_base * v_multiplicador, 2);

    INSERT INTO COMPRA (CodigoReserva, StatusCompra, FormaPagamento, CPFCliente)
    VALUES (p_codigo_reserva, 'Confirmada', p_forma_pagamento, p_cpf_cliente);

    INSERT INTO PASSAGEM (NumPassagem, ValorPago, StatusPassagem, CodigoReserva, NomeTipo)
    VALUES (p_num_passagem, v_valor_final, 'Emitida', p_codigo_reserva, p_nome_tipo);

    -- DISPARA AUTOMATICAMENTE O TRIGGER e UNIQUE
    INSERT INTO CARTAO_EMBARQUE (NumPassagem, NumEmbarque, NumeroAssento, StatusEmbarque, NumVoo)
    VALUES (p_num_passagem, p_num_embarque, p_numero_assento, 'Emitido', p_num_voo);

    RETURN v_valor_final;
END;
$$ LANGUAGE plpgsql;