import os
import time
import psycopg2

DB_HOST = os.getenv("DB_HOST", os.getenv("PGHOST", "db"))
DB_PORT = int(os.getenv("DB_PORT", os.getenv("PGPORT", 5432)))
DB_NAME = os.getenv("DB_NAME", os.getenv("PGDATABASE", "appdb"))
DB_USER = os.getenv("DB_USER", os.getenv("PGUSER", "app"))
DB_PASS = os.getenv("DB_PASS", os.getenv("PGPASSWORD", "secret"))


def wait_for_db(retries: int = 30, delay: float = 1.0):
    for i in range(retries):
        try:
            conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS)
            conn.close()
            print("Banco disponível para migração")
            return
        except Exception as e:
            print(f"Aguardando DB ({i+1}/{retries})... {e}")
            time.sleep(delay)
    raise RuntimeError("DB não ficou disponível a tempo")


esschema_sql = """
CREATE TABLE IF NOT EXISTS Usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  perfil TEXT
);

CREATE TABLE IF NOT EXISTS Notificacao (
  id_notificacao SERIAL PRIMARY KEY,
  mensagem TEXT NOT NULL,
  dataNotif DATE NOT NULL,
  id_usuario INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Proposta (
  id_proposta SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_submissao DATE NOT NULL,
  status TEXT,
  anexos BYTEA,
  id_usuario INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Curso (
  id_curso SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS Projeto (
  id_projeto SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,
  status TEXT,
  feedback TEXT,
  fk_curso_id_curso INTEGER NOT NULL REFERENCES Curso(id_curso) ON DELETE CASCADE,
  fk_proposta_id_proposta INTEGER NOT NULL REFERENCES Proposta(id_proposta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Feedback (
  id_feedback SERIAL PRIMARY KEY,
  comentario TEXT,
  anexos BYTEA,
  data DATE NOT NULL,
  fk_usuario_id_usuario INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  id_projeto INTEGER NOT NULL REFERENCES Projeto(id_projeto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Projeto_Aluno (
  idprojetoaluno SERIAL PRIMARY KEY,
  fk_projeto_id_projeto INTEGER NOT NULL REFERENCES Projeto(id_projeto) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);
"""


def create_schema():
    wait_for_db()
    with psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS) as conn:
        with conn.cursor() as cur:
            cur.execute(esschema_sql)
        conn.commit()
        print("Tabelas criadas/validadas com sucesso no PostgreSQL")


if __name__ == "__main__":
    create_schema()
