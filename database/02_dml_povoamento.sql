BEGIN;

--#1 - POVOAMENTO: USUÁRIOS BASE (TODOS AQUELES QUE INTERAGEM COM O SISTEMA)
INSERT INTO USUARIO (CPF, Nome, "E-mail", Telefone, DataDeNascimento) VALUES
-- CLIENTES
('11111111111', 'João Silva', 'joao.cliente@email.com', '+5531990000001', '1985-10-15'),
('22222222222', 'Maria Santos', 'maria.cliente@email.com', '+5531990000002', '1990-05-20'),
('10101010101', 'Lucas Oliveira', 'lucas.oliveira@email.com', '+5532991110001', '1998-02-11'),
('12121212121', 'Fernanda Costa', 'fernanda.costa@email.com', '+5511991110002', '1994-07-03'),
('13131313131', 'Rafael Almeida', 'rafael.almeida@email.com', '+5521991110003', '1987-12-19'),
('14141414141', 'Beatriz Lima', 'beatriz.lima@email.com', '+5571991110004', '2001-04-27'),
('15151515151', 'Gustavo Pereira', 'gustavo.pereira@email.com', '+5561991110005', '1979-09-08'),
('16161616161', 'Camila Rocha', 'camila.rocha@email.com', '+5531991110006', '1996-01-30'),
-- GERENTES
('33333333333', 'Carlos Gerente', 'carlos.ger@decolae.com', '+5531990000003', '1978-03-12'),
('99999999999', 'Roberta Antunes', 'roberta.ger@decolae.com', '+5531990000009', '1983-06-21'),
-- ADMINISTRADORES
('44444444444', 'Ana Admin', 'ana.adm@decolae.com', '+5531990000004', '1982-11-08'),
('20202020202', 'Diego Moura', 'diego.adm@decolae.com', '+5531990000020', '1989-08-14'),
-- TRIPULANTES TÉCNICOS (PILOTOS E COPILOTOS)
('55555555555', 'Pedro Piloto', 'pedro.tec@decolae.com', '+5531990000005', '1975-07-22'),
('66666666666', 'Paulo Copiloto', 'paulo.tec@decolae.com', '+5531990000006', '1988-01-30'),
('21212121212', 'Ricardo Mendes', 'ricardo.tec@decolae.com', '+5531990000021', '1976-05-02'),
('23232323232', 'Fábio Nunes', 'fabio.tec@decolae.com', '+5531990000023', '1990-10-17'),
('24242424242', 'Luana Ferreira', 'luana.tec@decolae.com', '+5531990000024', '1984-03-25'),
('25252525252', 'Henrique Souza', 'henrique.tec@decolae.com', '+5531990000025', '1992-11-09'),
('26262626262', 'Patrícia Gomes', 'patricia.tec@decolae.com', '+5531990000026', '1981-02-14'),
('27272727272', 'Marcelo Dias', 'marcelo.tec@decolae.com', '+5531990000027', '1993-06-06'),
-- COMISSÁRIOS DE BORDO
('77777777777', 'Sara Comissaria', 'sara.com@decolae.com', '+5531990000007', '1992-09-14'),
('88888888888', 'Marta Comissaria', 'marta.com@decolae.com', '+5531990000008', '1995-12-05'),
('31313131313', 'Juliana Ribeiro', 'juliana.com@decolae.com', '+5531990000031', '1997-04-12'),
('32323232323', 'Thiago Martins', 'thiago.com@decolae.com', '+5531990000032', '1994-08-28'),
('34343434343', 'Larissa Barros', 'larissa.com@decolae.com', '+5531990000034', '1999-01-07'),
('35353535353', 'Vitor Cardoso', 'vitor.com@decolae.com', '+5531990000035', '1991-03-19'),
('36363636363', 'Aline Teixeira', 'aline.com@decolae.com', '+5531990000036', '1996-10-23'),
('37373737373', 'Igor Moreira', 'igor.com@decolae.com', '+5531990000037', '1993-12-01');


--#2 - POVOAMENTO: SUBCLASSES DE USUÁRIO (CLIENTES E FUNCIONÁRIOS)
INSERT INTO CLIENTE (CPF) VALUES
('11111111111'),
('22222222222'),
('10101010101'),
('12121212121'),
('13131313131'),
('14141414141'),
('15151515151'),
('16161616161');

INSERT INTO FUNCIONARIO (CPF, NumCredencial) VALUES
('33333333333', 'CRED-GER-001'),
('99999999999', 'CRED-GER-002'),
('44444444444', 'CRED-ADM-001'),
('20202020202', 'CRED-ADM-002'),
('55555555555', 'CRED-TEC-001'),
('66666666666', 'CRED-TEC-002'),
('21212121212', 'CRED-TEC-003'),
('23232323232', 'CRED-TEC-004'),
('24242424242', 'CRED-TEC-005'),
('25252525252', 'CRED-TEC-006'),
('26262626262', 'CRED-TEC-007'),
('27272727272', 'CRED-TEC-008'),
('77777777777', 'CRED-COM-001'),
('88888888888', 'CRED-COM-002'),
('31313131313', 'CRED-COM-003'),
('32323232323', 'CRED-COM-004'),
('34343434343', 'CRED-COM-005'),
('35353535353', 'CRED-COM-006'),
('36363636363', 'CRED-COM-007'),
('37373737373', 'CRED-COM-008');

--# 3 - POVOAMENTO: SUBCLASSES DE FUNCIONÁRIO
INSERT INTO GERENTE (CPF) VALUES
('33333333333'),
('99999999999');

INSERT INTO ADMINISTRADOR (CPF) VALUES
('44444444444'),
('20202020202');

--TRIPULANTES PRECISAM DO CPF DO GERENTE QUE OS CADASTROU
INSERT INTO TRIPULANTE (CPF, HorasVoadasDia, FimUltimoDescanso, CPF_Gerente) VALUES
('55555555555', 0.00, '2026-11-20 08:00:00', '33333333333'),
('66666666666', 0.00, '2026-11-20 08:00:00', '33333333333'),
('21212121212', 0.00, '2026-11-20 08:00:00', '33333333333'),
('23232323232', 0.00, '2026-11-20 08:00:00', '33333333333'),
('24242424242', 0.00, '2026-11-20 08:00:00', '99999999999'),
('25252525252', 0.00, '2026-11-20 08:00:00', '99999999999'),
('26262626262', 0.00, '2026-11-20 08:00:00', '99999999999'),
('27272727272', 0.00, '2026-11-20 08:00:00', '99999999999'),
('77777777777', 0.00, '2026-11-20 08:00:00', '33333333333'),
('88888888888', 0.00, '2026-11-20 08:00:00', '33333333333'),
('31313131313', 0.00, '2026-11-20 08:00:00', '33333333333'),
('32323232323', 0.00, '2026-11-20 08:00:00', '33333333333'),
('34343434343', 0.00, '2026-11-20 08:00:00', '99999999999'),
('35353535353', 0.00, '2026-11-20 08:00:00', '99999999999'),
('36363636363', 0.00, '2026-11-20 08:00:00', '99999999999'),
('37373737373', 0.00, '2026-11-20 08:00:00', '99999999999');

--# 4 - POVOAMENTO: SUBCLASSES DE TRIPULANTE
INSERT INTO TRIPULANTE_TECNICO (CPF, CodigoANAC) VALUES
('55555555555', 'ANAC-12345'),
('66666666666', 'ANAC-67890'),
('21212121212', 'ANAC-24680'),
('23232323232', 'ANAC-13579'),
('24242424242', 'ANAC-11223'),
('25252525252', 'ANAC-44556'),
('26262626262', 'ANAC-77889'),
('27272727272', 'ANAC-99001');

INSERT INTO COMISSARIO_BORDO (CPF) VALUES
('77777777777'),
('88888888888'),
('31313131313'),
('32323232323'),
('34343434343'),
('35353535353'),
('36363636363'),
('37373737373');

--# 5 - POVOAMENTO: INFRAESTRUTURA DE VOOS (AERONAVES E TRAJETOS CADASTRADOS PELOS GERENTES)
INSERT INTO AERONAVE (ID_Aeronave, Modelo, NumAssentos, CPF_Gerente) VALUES
('PR-XYZ', 'Boeing 737-800', 180, '33333333333'),
('PR-ABC', 'Airbus A320', 174, '33333333333'),
('PR-DEF', 'Embraer E195', 118, '99999999999'),
('PR-KAB', 'Cessna Grand Caravan', 9, '99999999999');

INSERT INTO TRAJETO (NumTrajeto, AeroportoOrigem, AeroportoDestino, Origem, Destino, CPF_Gerente) VALUES
('TRJ-CNF-GRU', 'Aeroporto Internacional de Confins (CNF)', 'Aeroporto Internacional de Guarulhos (GRU)', 'Belo Horizonte, MG', 'São Paulo, SP', '33333333333'),
('TRJ-GRU-CNF', 'Aeroporto Internacional de Guarulhos (GRU)', 'Aeroporto Internacional de Confins (CNF)', 'São Paulo, SP', 'Belo Horizonte, MG', '33333333333'),
('TRJ-GRU-GIG', 'Aeroporto Internacional de Guarulhos (GRU)', 'Aeroporto Internacional do Galeão (GIG)', 'São Paulo, SP', 'Rio de Janeiro, RJ', '33333333333'),
('TRJ-GIG-SSA', 'Aeroporto Internacional do Galeão (GIG)', 'Aeroporto Internacional de Salvador (SSA)', 'Rio de Janeiro, RJ', 'Salvador, BA', '33333333333'),
('TRJ-CNF-BSB', 'Aeroporto Internacional de Confins (CNF)', 'Aeroporto Internacional de Brasília (BSB)', 'Belo Horizonte, MG', 'Brasília, DF', '99999999999'),
('TRJ-BSB-REC', 'Aeroporto Internacional de Brasília (BSB)', 'Aeroporto Internacional do Recife (REC)', 'Brasília, DF', 'Recife, PE', '99999999999'),
('TRJ-CNF-JDR', 'Aeroporto Internacional de Confins (CNF)', 'Aeroporto de São João del-Rei (JDR)', 'Belo Horizonte, MG', 'São João del-Rei, MG', '99999999999');

--# 6 - POVOAMENTO: VOOS (CRIADOS PELOS ADMINISTRADORES)
-- EQUIPES USADAS (PILOTO / COPILOTO / 2 COMISSÁRIOS):
--   A: Pedro / Paulo / Sara, Marta
--   B: Ricardo / Fábio / Juliana, Thiago
--   C: Luana / Henrique / Larissa, Vitor
--   D: Patrícia / Marcelo / Aline, Igor
-- NENHUMA AERONAVE OU TRIPULANTE ESTÁ EM DOIS VOOS COM HORÁRIOS SOBREPOSTOS.
INSERT INTO VOO (NumVoo, DataVoo, Status, HorarioPrevistoPartida, HorarioPrevistoChegada, ValorBase, CPFAdministrador, NumAeronave, NumTrajeto) VALUES
('VOO-1001', '2026-12-05', 'Programado', '2026-12-05 10:00:00', '2026-12-05 11:20:00', 450.00, '44444444444', 'PR-XYZ', 'TRJ-CNF-GRU'),
('VOO-1002', '2026-12-05', 'Programado', '2026-12-05 14:00:00', '2026-12-05 15:20:00', 450.00, '44444444444', 'PR-XYZ', 'TRJ-GRU-CNF'),
('VOO-1003', '2026-11-28', 'Programado', '2026-11-28 08:00:00', '2026-11-28 09:05:00', 320.00, '44444444444', 'PR-ABC', 'TRJ-GRU-GIG'),
('VOO-1004', '2026-11-28', 'Programado', '2026-11-28 11:00:00', '2026-11-28 13:10:00', 610.00, '44444444444', 'PR-ABC', 'TRJ-GIG-SSA'),
('VOO-1005', '2026-12-01', 'Programado', '2026-12-01 07:30:00', '2026-12-01 08:45:00', 390.00, '20202020202', 'PR-DEF', 'TRJ-CNF-BSB'),
('VOO-1006', '2026-12-01', 'Programado', '2026-12-01 10:30:00', '2026-12-01 13:00:00', 680.00, '20202020202', 'PR-DEF', 'TRJ-BSB-REC'),
('VOO-1007', '2026-12-10', 'Programado', '2026-12-10 18:00:00', '2026-12-10 19:20:00', 480.00, '20202020202', 'PR-ABC', 'TRJ-CNF-GRU'),
('VOO-1008', '2026-12-03', 'Programado', '2026-12-03 09:00:00', '2026-12-03 09:50:00', 290.00, '20202020202', 'PR-KAB', 'TRJ-CNF-JDR'),
('VOO-1009', '2026-12-15', 'Atrasado',   '2026-12-15 16:00:00', '2026-12-15 17:05:00', 350.00, '44444444444', 'PR-XYZ', 'TRJ-GRU-GIG'),
('VOO-1010', '2026-12-18', 'Cancelado',  '2026-12-18 07:30:00', '2026-12-18 08:45:00', 390.00, '44444444444', 'PR-DEF', 'TRJ-CNF-BSB');

--# 7 - POVOAMENTO: ESCALAS DA TRIPULAÇÃO NOS VOOS (TODO VOO TEM 1 PILOTO, 1 COPILOTO E 2 COMISSÁRIOS)
INSERT INTO ESCALA_TECNICA (CPFTripulanteTecnico, NumVoo, FuncaoVoo) VALUES
('55555555555', 'VOO-1001', 'Piloto'),   ('66666666666', 'VOO-1001', 'Copiloto'),
('55555555555', 'VOO-1002', 'Piloto'),   ('66666666666', 'VOO-1002', 'Copiloto'),
('21212121212', 'VOO-1003', 'Piloto'),   ('23232323232', 'VOO-1003', 'Copiloto'),
('21212121212', 'VOO-1004', 'Piloto'),   ('23232323232', 'VOO-1004', 'Copiloto'),
('24242424242', 'VOO-1005', 'Piloto'),   ('25252525252', 'VOO-1005', 'Copiloto'),
('24242424242', 'VOO-1006', 'Piloto'),   ('25252525252', 'VOO-1006', 'Copiloto'),
('26262626262', 'VOO-1007', 'Piloto'),   ('27272727272', 'VOO-1007', 'Copiloto'),
('26262626262', 'VOO-1008', 'Piloto'),   ('27272727272', 'VOO-1008', 'Copiloto'),
('21212121212', 'VOO-1009', 'Piloto'),   ('23232323232', 'VOO-1009', 'Copiloto'),
('24242424242', 'VOO-1010', 'Piloto'),   ('25252525252', 'VOO-1010', 'Copiloto');

INSERT INTO ESCALA_COMISSARIO (CPFComissario, NumVoo) VALUES
('77777777777', 'VOO-1001'), ('88888888888', 'VOO-1001'),
('77777777777', 'VOO-1002'), ('88888888888', 'VOO-1002'),
('31313131313', 'VOO-1003'), ('32323232323', 'VOO-1003'),
('31313131313', 'VOO-1004'), ('32323232323', 'VOO-1004'),
('34343434343', 'VOO-1005'), ('35353535353', 'VOO-1005'),
('34343434343', 'VOO-1006'), ('35353535353', 'VOO-1006'),
('36363636363', 'VOO-1007'), ('37373737373', 'VOO-1007'),
('36363636363', 'VOO-1008'), ('37373737373', 'VOO-1008'),
('31313131313', 'VOO-1009'), ('32323232323', 'VOO-1009'),
('34343434343', 'VOO-1010'), ('35353535353', 'VOO-1010');

--# 8 - POVOAMENTO: TIPOS DE PASSAGEM (VALOR PAGO = VALOR BASE DO VOO x MULTIPLICADOR)
INSERT INTO TIPO_PASSAGEM (NomeTipo, Multiplicador) VALUES
('Econômica', 1.00),
('Econômica Premium', 1.50),
('Executiva', 2.50);

--# 9 - POVOAMENTO: OPERAÇÕES COMERCIAIS (COMPRA, PASSAGEM, CARTÃO DE EMBARQUE)
INSERT INTO COMPRA (CodigoReserva, StatusCompra, FormaPagamento, CPFCliente) VALUES
('RES-A1B2C3', 'Confirmada', 'Cartão de Crédito', '11111111111'),
('RES-B2C3D4', 'Confirmada', 'PIX',               '22222222222'),
('RES-C3D4E5', 'Confirmada', 'Cartão de Crédito', '10101010101'),
('RES-D4E5F6', 'Confirmada', 'Boleto',            '12121212121'),
('RES-E5F6G7', 'Confirmada', 'Cartão de Crédito', '13131313131'),
('RES-F6G7H8', 'Confirmada', 'PIX',               '14141414141'),
('RES-G7H8I9', 'Confirmada', 'Cartão de Crédito', '15151515151'),
-- VOO-1008 (CESSNA DE 9 LUGARES): 8 ASSENTOS VENDIDOS, SOBRA SÓ O 5A (DEMONSTRAÇÃO DA REGRA DE CAPACIDADE)
('RES-H8I9J1', 'Confirmada', 'PIX',               '16161616161'),
('RES-I9J1K2', 'Confirmada', 'Cartão de Crédito', '11111111111'),
('RES-J1K2L3', 'Confirmada', 'PIX',               '22222222222'),
('RES-K2L3M4', 'Confirmada', 'Cartão de Crédito', '10101010101'),
('RES-L3M4N5', 'Confirmada', 'PIX',               '12121212121'),
('RES-M4N5O6', 'Confirmada', 'Cartão de Crédito', '14141414141'),
('RES-N5O6P7', 'Confirmada', 'PIX',               '15151515151');

INSERT INTO PASSAGEM (NumPassagem, ValorPago, StatusPassagem, CodigoReserva, NomeTipo) VALUES
('PAS-999123',  450.00, 'Emitida', 'RES-A1B2C3', 'Econômica'), -- VOO-1001
('PAS-000201',  800.00, 'Emitida', 'RES-B2C3D4', 'Executiva'), -- VOO-1003 (320 x 2,5)
('PAS-000202',  450.00, 'Emitida', 'RES-C3D4E5', 'Econômica'), -- VOO-1001
('PAS-000203',  585.00, 'Emitida', 'RES-D4E5F6', 'Econômica Premium'),-- VOO-1005 (390 x 1,5)
('PAS-000204', 1700.00, 'Emitida', 'RES-E5F6G7', 'Executiva'),-- VOO-1006 (680 x 2,5)
('PAS-000205',  610.00, 'Emitida', 'RES-F6G7H8', 'Econômica'),-- VOO-1004
('PAS-000206',  480.00, 'Emitida', 'RES-G7H8I9', 'Econômica'), -- VOO-1007 (COMPRA COM 2 PASSAGENS)
('PAS-000207',  480.00, 'Emitida', 'RES-G7H8I9', 'Econômica'),-- VOO-1007
('PAS-000301',  290.00, 'Emitida', 'RES-H8I9J1', 'Econômica'), -- VOO-1008 (COMPRA COM 2 PASSAGENS)
('PAS-000302',  290.00, 'Emitida', 'RES-H8I9J1', 'Econômica'), -- VOO-1008
('PAS-000303',  290.00, 'Emitida', 'RES-I9J1K2', 'Econômica'), -- VOO-1008
('PAS-000304',  290.00, 'Emitida', 'RES-J1K2L3', 'Econômica'),-- VOO-1008
('PAS-000305',  290.00, 'Emitida', 'RES-K2L3M4', 'Econômica'), -- VOO-1008
('PAS-000306',  290.00, 'Emitida', 'RES-L3M4N5', 'Econômica'), -- VOO-1008
('PAS-000307',  290.00, 'Emitida', 'RES-M4N5O6', 'Econômica'), -- VOO-1008
('PAS-000308',  290.00, 'Emitida', 'RES-N5O6P7', 'Econômica'); -- VOO-1008

--O CARTÃO DE EMBARQUE É VINCULADO À PASSAGEM E AO VOO
INSERT INTO CARTAO_EMBARQUE (NumPassagem, NumEmbarque, NumeroAssento, StatusEmbarque, NumVoo) VALUES
('PAS-999123', 'EMB-001', '12A', 'Emitido', 'VOO-1001'),
('PAS-000201', 'EMB-201', '3C',  'Emitido', 'VOO-1003'),
('PAS-000202', 'EMB-202', '14B', 'Emitido', 'VOO-1001'),
('PAS-000203', 'EMB-203', '7A',  'Emitido', 'VOO-1005'),
('PAS-000204', 'EMB-204', '2A',  'Emitido', 'VOO-1006'),
('PAS-000205', 'EMB-205', '20F', 'Emitido', 'VOO-1004'),
('PAS-000206', 'EMB-206', '10A', 'Emitido', 'VOO-1007'),
('PAS-000207', 'EMB-207', '10B', 'Emitido', 'VOO-1007'),
('PAS-000301', 'EMB-301', '1A',  'Emitido', 'VOO-1008'),
('PAS-000302', 'EMB-302', '1B',  'Emitido', 'VOO-1008'),
('PAS-000303', 'EMB-303', '2A',  'Emitido', 'VOO-1008'),
('PAS-000304', 'EMB-304', '2B',  'Emitido', 'VOO-1008'),
('PAS-000305', 'EMB-305', '3A',  'Emitido', 'VOO-1008'),
('PAS-000306', 'EMB-306', '3B',  'Emitido', 'VOO-1008'),
('PAS-000307', 'EMB-307', '4A',  'Emitido', 'VOO-1008'),
('PAS-000308', 'EMB-308', '4B',  'Emitido', 'VOO-1008');

COMMIT;
