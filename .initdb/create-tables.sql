CREATE TABLE IF NOT EXISTS Usuario
(
    id_usuario SERIAL PRIMARY KEY,
    nome       VARCHAR(50)         NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    telefone   VARCHAR(15)         NOT NULL,
    telefone_is_whats BOOLEAN         NOT NULL DEFAULT FALSE,
    senha      VARCHAR(30)         NOT NULL,
    ativo      BOOLEAN             NOT NULL DEFAULT TRUE,
    perfil     VARCHAR(15)         NOT NULL
        CHECK (perfil IN ('Administrador', 'Supervisor', 'Mediador', 'Aluno', 'Comunidade'))
);

CREATE TABLE IF NOT EXISTS Notificacao
(
    id_notificacao SERIAL PRIMARY KEY,
    mensagem       TEXT    NOT NULL,
    dataNotif      DATE    NOT NULL DEFAULT CURRENT_DATE,
    id_usuario     INTEGER NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Proposta
(
    id_proposta    SERIAL PRIMARY KEY,
    titulo         VARCHAR(100) NOT NULL,
    descricao      TEXT         NOT NULL,
    data_submissao DATE         NOT NULL DEFAULT CURRENT_DATE,
    telefone_contato_opcional VARCHAR(15),
    telefone_contato_opcional_is_whats BOOLEAN NOT NULL DEFAULT FALSE,
    email_contato_opcional    VARCHAR(100),
    status         VARCHAR(50)  NOT NULL,
    anexos         TEXT,
    id_usuario     INTEGER      NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Curso
(
    id_curso  SERIAL PRIMARY KEY,
    nome      VARCHAR(60) NOT NULL,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS Projeto
(
    id_projeto              SERIAL PRIMARY KEY,
    titulo                  VARCHAR(100) NOT NULL,
    descricao               TEXT         NOT NULL,
    prazo                   DATE,
    status                  VARCHAR(50)  NOT NULL,
    anexos                  TEXT,
    fk_curso_id_curso       INTEGER      NOT NULL REFERENCES Curso (id_curso) ON DELETE CASCADE,
    fk_proposta_id_proposta INTEGER      NOT NULL REFERENCES Proposta (id_proposta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Feedback
(
    id_feedback           SERIAL PRIMARY KEY,
    comentario            TEXT,
    anexos                TEXT,
    data                  DATE    NOT NULL DEFAULT CURRENT_DATE,
    fk_usuario_id_usuario INTEGER NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    id_projeto            INTEGER NOT NULL REFERENCES Projeto (id_projeto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Projeto_Aluno
(
    id_projeto_aluno      SERIAL PRIMARY KEY,
    fk_projeto_id_projeto INTEGER NOT NULL REFERENCES Projeto (id_projeto) ON DELETE CASCADE,
    id_usuario            INTEGER NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE
);

Alter table Projeto
    add column id_feedback INTEGER REFERENCES Feedback (id_feedback) ON DELETE SET NULL;