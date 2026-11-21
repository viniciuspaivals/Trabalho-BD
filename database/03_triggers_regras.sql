-- CAPACIDADE DA AERONAVE + CONTROLE DE CONCORRÊNCIA (SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION fn_validar_capacidade_voo()
RETURNS TRIGGER AS $$
DECLARE
    v_capacidade INT;
    v_ocupados INT;
BEGIN
    -- BLOQUEIA A LINHA DO VOO ATE O FIM DA TRANSACAO PARA EVITAR VENDA SIMULTANEA DO ULTIMMO ASSENTO
    SELECT a.NumAssentos INTO v_capacidade
    FROM VOO v
    JOIN AERONAVE a ON v.NumAeronave = a.ID_Aeronave
    WHERE v.NumVoo = NEW.NumVoo
    FOR UPDATE OF v;

    SELECT COUNT(*) INTO v_ocupados
    FROM CARTAO_EMBARQUE
    WHERE NumVoo = NEW.NumVoo;

    IF v_ocupados >= v_capacidade THEN
        RAISE EXCEPTION 'RN08: Voo % atingiu a capacidade máxima de % assentos.', NEW.NumVoo, v_capacidade;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_capacidade_voo
BEFORE INSERT ON CARTAO_EMBARQUE
FOR EACH ROW EXECUTE FUNCTION fn_validar_capacidade_voo();

-- AERONAVE NÃO PODE SER ALOCADA EM VOOS COM HORARIOS SOBREPOSTOS
CREATE OR REPLACE FUNCTION fn_validar_conflito_aeronave()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM VOO
        WHERE NumAeronave = NEW.NumAeronave
          AND NumVoo <> NEW.NumVoo
          AND Status <> 'Cancelado'
          AND (NEW.HorarioPrevistoPartida < HorarioPrevistoChegada
               AND NEW.HorarioPrevistoChegada > HorarioPrevistoPartida)
    ) THEN
        RAISE EXCEPTION 'RN11: A aeronave % já está alocada em outro voo neste horário.', NEW.NumAeronave;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_conflito_aeronave
BEFORE INSERT OR UPDATE ON VOO
FOR EACH ROW EXECUTE FUNCTION fn_validar_conflito_aeronave();

-- CONFLITO DE HORARIO DE TRIPULANTE + REGRA DE DESCANSO
CREATE OR REPLACE FUNCTION fn_validar_escala_tripulante()
RETURNS TRIGGER AS $$
DECLARE
    v_cpf VARCHAR(11);
    v_partida TIMESTAMP;
    v_chegada TIMESTAMP;
    v_duracao_horas NUMERIC(5,2);
    v_horas_voadas NUMERIC(5,2);
    v_fim_descanso TIMESTAMP;
BEGIN
    -- IDENTIFICA O CPF CONFORME A TABELA QUE DISPAROU O TRIGGER
    IF TG_TABLE_NAME = 'escala_tecnica' THEN
        v_cpf := NEW.CPFTripulanteTecnico;
    ELSE
        v_cpf := NEW.CPFComissario;
    END IF;

    SELECT HorarioPrevistoPartida, HorarioPrevistoChegada
    INTO v_partida, v_chegada
    FROM VOO WHERE NumVoo = NEW.NumVoo;

    -- VERIFICA A SOBREPOSICAO DE HORARIO EM QUALQUER ESCALA (TECNICO OU COMISSARIO)
    IF EXISTS (
        SELECT 1 FROM ESCALA_TECNICA et
        JOIN VOO v ON et.NumVoo = v.NumVoo
        WHERE et.CPFTripulanteTecnico = v_cpf
          AND v.NumVoo <> NEW.NumVoo
          AND v.Status <> 'Cancelado'
          AND (v_partida < v.HorarioPrevistoChegada AND v_chegada > v.HorarioPrevistoPartida)
        UNION ALL
        SELECT 1 FROM ESCALA_COMISSARIO ec
        JOIN VOO v ON ec.NumVoo = v.NumVoo
        WHERE ec.CPFComissario = v_cpf
          AND v.NumVoo <> NEW.NumVoo
          AND v.Status <> 'Cancelado'
          AND (v_partida < v.HorarioPrevistoChegada AND v_chegada > v.HorarioPrevistoPartida)
    ) THEN
        RAISE EXCEPTION 'RN12: Tripulante % já está escalado em outro voo com horário sobreposto.', v_cpf;
    END IF;

    -- VERIFICA JORNADA > 12h E DESCANSO MINIMO DE 36h
    SELECT COALESCE(HorasVoadasDia, 0), FimUltimoDescanso
    INTO v_horas_voadas, v_fim_descanso
    FROM TRIPULANTE WHERE CPF = v_cpf;

    v_duracao_horas := EXTRACT(EPOCH FROM (v_chegada - v_partida)) / 3600.0;

    IF v_horas_voadas > 12 AND (v_fim_descanso IS NULL OR v_partida < v_fim_descanso + INTERVAL '36 hours') THEN
        RAISE EXCEPTION 'RN13: Tripulante % ultrapassou 12h de jornada e precisa cumprir 36h de descanso.', v_cpf;
    END IF;

    -- Atualiza horas voadas acumuladas
    UPDATE TRIPULANTE
    SET HorasVoadasDia = COALESCE(HorasVoadasDia, 0) + v_duracao_horas
    WHERE CPF = v_cpf;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_escala_tecnica_regras
BEFORE INSERT ON ESCALA_TECNICA
FOR EACH ROW EXECUTE FUNCTION fn_validar_escala_tripulante();

CREATE TRIGGER trg_escala_comissario_regras
BEFORE INSERT ON ESCALA_COMISSARIO
FOR EACH ROW EXECUTE FUNCTION fn_validar_escala_tripulante();

-- ESPECIALIZACAO DISJUNTA DE FUNCIONARIO (GERENTE/ADMIN/TRIPULANTE)
CREATE OR REPLACE FUNCTION fn_validar_disjuncao_funcionario()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'gerente' AND (
        EXISTS (SELECT 1 FROM ADMINISTRADOR WHERE CPF = NEW.CPF) OR
        EXISTS (SELECT 1 FROM TRIPULANTE WHERE CPF = NEW.CPF)
    ) THEN
        RAISE EXCEPTION 'RN17: Funcionário % já pertence a outra subclasse.', NEW.CPF;
    ELSIF TG_TABLE_NAME = 'administrador' AND (
        EXISTS (SELECT 1 FROM GERENTE WHERE CPF = NEW.CPF) OR
        EXISTS (SELECT 1 FROM TRIPULANTE WHERE CPF = NEW.CPF)
    ) THEN
        RAISE EXCEPTION 'RN17: Funcionário % já pertence a outra subclasse.', NEW.CPF;
    ELSIF TG_TABLE_NAME = 'tripulante' AND (
        EXISTS (SELECT 1 FROM GERENTE WHERE CPF = NEW.CPF) OR
        EXISTS (SELECT 1 FROM ADMINISTRADOR WHERE CPF = NEW.CPF)
    ) THEN
        RAISE EXCEPTION 'RN17: Funcionário % já pertence a outra subclasse.', NEW.CPF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_disj_gerente BEFORE INSERT ON GERENTE FOR EACH ROW EXECUTE FUNCTION fn_validar_disjuncao_funcionario();
CREATE TRIGGER trg_disj_admin BEFORE INSERT ON ADMINISTRADOR FOR EACH ROW EXECUTE FUNCTION fn_validar_disjuncao_funcionario();
CREATE TRIGGER trg_disj_tripulante BEFORE INSERT ON TRIPULANTE FOR EACH ROW EXECUTE FUNCTION fn_validar_disjuncao_funcionario();