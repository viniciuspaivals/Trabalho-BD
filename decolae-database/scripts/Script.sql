--TABELA RAIZ: 'USUARIO'
create table USUARIO (
	CPF VARCHAR(11) primary key,
	Nome VARCHAR(100) not null,
	"E-mail" VARCHAR(100) unique not null,
	Telefone VARCHAR(20),
	DataDeNascimento date 
);

--SUBCLASSES DE 'USUARIO'
create table CLIENTE(
	CPF VARCHAR(11) primary key,
	foreign key (CPF) references USUARIO(CPF) on delete cascade 
);

create table FUNCIONARIO(
	CPF VARCHAR(11) primary key,
	NumCredencial VARCHAR(50) unique not null,
	foreign key (CPF) references USUARIO(CPF) on delete cascade 
);

--SUBCLASSES DE 'FUNCIONARIO'
create table GERENTE(
	CPF VARCHAR(11) primary key,
	foreign key (CPF) references FUNCIONARIO(CPF) on delete cascade
);

create table ADMINISTRADOR(
	CPF VARCHAR(11) primary key,
	foreign key (CPF) references FUNCIONARIO(CPF) on delete cascade 
);

create table TRIPULANTE(
	CPF VARCHAR(11) primary key,
	HorasVoadasDia NUMERIC(5,2),
	FimUltimoDescanso TIMESTAMP,
	CPF_Gerente VARCHAR(11) not null,
	foreign key (CPF) references FUNCIONARIO(CPF) on delete cascade,
	foreign key (CPF_Gerente) references GERENTE(CPF)
);

--SUBCLASSES DE 'TRIPULANTE'
create table TRIPULANTE_TECNICO(
	CPF VARCHAR(11) primary key,
	CodigoANAC VARCHAR(50) unique not null,
	foreign key (CPF) references TRIPULANTE(CPF) on delete cascade
);

create table COMISSARIO_BORDO(
	CPF VARCHAR(11) primary key,
	foreign key (CPF) references TRIPULANTE(CPF) on delete CASCADE
);

--TABELAS DE NEGOCIO E OPERACOES
create table COMPRA(
	CodigoReserva VARCHAR(20) primary key,
	StatusCompra VARCHAR(50) not null,
	FormaPagamento VARCHAR(50) not null,
	CPFCliente VARCHAR(11) not null,
	foreign key (CPFCliente) references CLIENTE(CPF)
);

create table TIPO_PASSAGEM(
	NomeTipo VARCHAR(50) primary key,
	Multiplicador NUMERIC(5,2) not NULL
);

create table PASSAGEM(
	NumPassagem VARCHAR(20) primary key,
	ValorPago NUMERIC(10,2) not null,
	StatusPassagem VARCHAR(50) not null,
	CodigoReserva VARCHAR(20) not null,
	NomeTipo VARCHAR(50) not null,
	foreign key (CodigoReserva) references COMPRA(CodigoReserva),
	foreign key (NomeTipo) references TIPO_PASSAGEM(NomeTipo)
);

create table AERONAVE(
	ID_Aeronave VARCHAR(20) primary key,
	Modelo VARCHAR(50) not null,
	NumAssentos INT not null,
	CPF_Gerente VARCHAR(11) not null,
	foreign key (CPF_Gerente) references GERENTE(CPF)
);

create table TRAJETO(
	NumTrajeto VARCHAR(20) primary key,
	AeroportoOrigem VARCHAR(100) not null,
	AeroportoDestino VARCHAR(100) not null,
	Origem VARCHAR(100) not null,
	Destino VARCHAR(100) not null,
	CPF_Gerente VARCHAR(11) not null,
	foreign key (CPF_Gerente) references GERENTE(CPF)
);

CREATE TABLE VOO (
    NumVoo VARCHAR(20) primary key,
    DataVoo DATE not null,
    Status VARCHAR(50) not null,
    HorarioPrevistoPartida TIMESTAMP not null,
    HorarioPrevistoChegada TIMESTAMP not null,
    ValorBase NUMERIC(10,2) not null,
    CPFAdministrador VARCHAR(11) not null,
    NumAeronave VARCHAR(20) not null,
    NumTrajeto VARCHAR(20) not null,
    FOREIGN KEY (CPFAdministrador) REFERENCES ADMINISTRADOR(CPF),
    FOREIGN KEY (NumAeronave) REFERENCES AERONAVE(ID_Aeronave),
    FOREIGN KEY (NumTrajeto) REFERENCES TRAJETO(NumTrajeto)
);

--ENTIDADE FRACA (DEPENDE DE 'PASSAGEM') E ASSOCIADA A 'VOO'
create table CARTAO_EMBARQUE(
	NumPassagem VARCHAR(20),
    NumEmbarque VARCHAR(20),
    NumeroAssento VARCHAR(10),
    StatusEmbarque VARCHAR(50),
    NumVoo VARCHAR(20) NOT NULL,
    PRIMARY KEY (NumPassagem, NumEmbarque),
    FOREIGN KEY (NumPassagem) REFERENCES PASSAGEM(NumPassagem) ON DELETE CASCADE,
    FOREIGN KEY (NumVoo) REFERENCES VOO(NumVoo)
);

--TABELAS DE ASSOCIACAO
create table ESCALA_TECNICA(
	CPFTripulanteTecnico VARCHAR(11),
	NumVoo VARCHAR(20),
	FuncaoVoo VARCHAR(50) not null,check,
	PRIMARY KEY (CPFTripulanteTecnico, NumVoo),
    FOREIGN KEY (CPFTripulanteTecnico) REFERENCES TRIPULANTE_TECNICO(CPF),
    FOREIGN KEY (NumVoo) REFERENCES VOO(NumVoo)
);

CREATE TABLE ESCALA_COMISSARIO (
    CPFComissario VARCHAR(11),
    NumVoo VARCHAR(20),
    PRIMARY KEY (CPFComissario, NumVoo),
    FOREIGN KEY (CPFComissario) REFERENCES COMISSARIO_BORDO(CPF),
    FOREIGN KEY (NumVoo) REFERENCES VOO(NumVoo)
);
	