import os
import time
import psycopg2
from datetime import date, timedelta
from faker import Faker
from psycopg2.extras import execute_values

fake = Faker("pt_BR")

DB_HOST = os.getenv("DB_HOST", os.getenv("PGHOST", "db"))
DB_PORT = int(os.getenv("DB_PORT", os.getenv("PGPORT", 5432)))
DB_NAME = os.getenv("DB_NAME", os.getenv("PGDATABASE", "appdb"))
DB_USER = os.getenv("DB_USER", os.getenv("PGUSER", "app"))
DB_PASS = os.getenv("DB_PASS", os.getenv("PGPASSWORD", "secret"))


def wait_for_db(retries=30, delay=1):
    for i in range(retries):
        try:
            conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS)
            conn.close()
            print("Banco disponível")
            return
        except Exception as e:
            print(f"Aguardando DB ({i+1}/{retries})... {e}")
            time.sleep(delay)
    raise RuntimeError("DB não ficou disponível a tempo")


def fetch_ids(cur, table, id_col):
    cur.execute(f"SELECT {id_col} FROM {table};")
    return [r[0] for r in cur.fetchall()]


def bulk_insert_usuarios(conn, n=100):
    usuarios = []
    for _ in range(n):
        nome = fake.name()
        email = fake.unique.email()
        senha = fake.password(length=10)
        perfil = fake.random_element(elements=["aluno", "professor", "coordenador", None])
        usuarios.append((nome, email, senha, perfil))
    with conn.cursor() as cur:
        sql = "INSERT INTO Usuario (nome, email, senha, perfil) VALUES %s RETURNING id_usuario;"
        execute_values(cur, sql, usuarios)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Usuarios inseridos: {len(usuarios)}")
    return ids


def bulk_insert_cursos(conn, n=10):
    cursos = []
    for _ in range(n):
        nome = f"Curso de {fake.job()}"
        descricao = fake.sentence(nb_words=8)
        cursos.append((nome, descricao))
    with conn.cursor() as cur:
        sql = "INSERT INTO Curso (nome, descricao) VALUES %s RETURNING id_curso;"
        execute_values(cur, sql, cursos)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Cursos inseridos: {len(cursos)}")
    return ids


def bulk_insert_propostas(conn, user_ids, n=1000):
    if not user_ids:
        return []
    propostas = []
    today = date.today()
    for _ in range(n):
        titulo = fake.sentence(nb_words=4)
        descricao = fake.paragraph(nb_sentences=3)
        data_sub = today - timedelta(days=fake.random_int(min=0, max=120))
        status = fake.random_element(elements=["Nova", "Em análise", "Aprovada", "Rejeitada"]) 
        anexos = None
        id_usuario = fake.random_element(elements=user_ids)
        propostas.append((titulo, descricao, data_sub, status, anexos, id_usuario))
    with conn.cursor() as cur:
        sql = (
            "INSERT INTO Proposta (titulo, descricao, data_submissao, status, anexos, id_usuario) "
            "VALUES %s RETURNING id_proposta;"
        )
        execute_values(cur, sql, propostas)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Propostas inseridas: {len(propostas)}")
    return ids


def bulk_insert_projetos(conn, curso_ids, proposta_ids, n=200):
    if not curso_ids or not proposta_ids:
        return []
    projetos = []
    today = date.today()
    for _ in range(n):
        titulo = fake.sentence(nb_words=3)
        descricao = fake.paragraph(nb_sentences=2)
        prazo = today + timedelta(days=fake.random_int(min=15, max=180))
        status = fake.random_element(elements=["Aberto", "Em andamento", "Concluído", "Em atraso"]) 
        feedback = fake.sentence(nb_words=6)
        fk_curso = fake.random_element(elements=curso_ids)
        fk_proposta = fake.random_element(elements=proposta_ids)
        projetos.append((titulo, descricao, prazo, status, feedback, fk_curso, fk_proposta))
    with conn.cursor() as cur:
        sql = (
            "INSERT INTO Projeto (titulo, descricao, prazo, status, feedback, fk_curso_id_curso, fk_proposta_id_proposta) "
            "VALUES %s RETURNING id_projeto;"
        )
        execute_values(cur, sql, projetos)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Projetos inseridos: {len(projetos)}")
    return ids


def bulk_insert_feedbacks(conn, user_ids, projeto_ids, n=150):
    if not user_ids or not projeto_ids:
        return []
    feedbacks = []
    today = date.today()
    for _ in range(n):
        comentario = fake.sentence(nb_words=10)
        anexos = None
        data_fb = today - timedelta(days=fake.random_int(min=0, max=60))
        fk_usuario = fake.random_element(elements=user_ids)
        id_projeto = fake.random_element(elements=projeto_ids)
        feedbacks.append((comentario, anexos, data_fb, fk_usuario, id_projeto))
    with conn.cursor() as cur:
        sql = (
            "INSERT INTO Feedback (comentario, anexos, data, fk_usuario_id_usuario, id_projeto) "
            "VALUES %s RETURNING id_feedback;"
        )
        execute_values(cur, sql, feedbacks)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Feedbacks inseridos: {len(feedbacks)}")
    return ids


def bulk_insert_projeto_aluno(conn, projeto_ids, user_ids, pairs=120):
    if not projeto_ids or not user_ids:
        return []
    seen = set()
    rels = []
    attempts = 0
    max_attempts = pairs * 3
    while len(rels) < pairs and attempts < max_attempts:
        attempts += 1
        pid = fake.random_element(elements=projeto_ids)
        uid = fake.random_element(elements=user_ids)
        key = (pid, uid)
        if key in seen:
            continue
        seen.add(key)
        rels.append((pid, uid))
    if not rels:
        return []
    with conn.cursor() as cur:
        sql = "INSERT INTO Projeto_Aluno (fk_projeto_id_projeto, id_usuario) VALUES %s RETURNING idprojetoaluno;"
        execute_values(cur, sql, rels)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Vínculos Projeto_Aluno inseridos: {len(rels)}")
    return ids


def bulk_insert_notificacoes(conn, user_ids, n=120):
    if not user_ids:
        return []
    notifs = []
    today = date.today()
    for _ in range(n):
        mensagem = fake.sentence(nb_words=7)
        data_notif = today - timedelta(days=fake.random_int(min=0, max=30))
        uid = fake.random_element(elements=user_ids)
        notifs.append((mensagem, data_notif, uid))
    with conn.cursor() as cur:
        sql = "INSERT INTO Notificacao (mensagem, dataNotif, id_usuario) VALUES %s RETURNING id_notificacao;"
        execute_values(cur, sql, notifs)
        ids = [r[0] for r in cur.fetchall()]
    conn.commit()
    print(f"Notificações inseridas: {len(notifs)}")
    return ids


def main():
    wait_for_db()
    conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS)
    try:
        user_ids = bulk_insert_usuarios(conn, n=100)
        curso_ids = bulk_insert_cursos(conn, n=10)
        prop_ids = bulk_insert_propostas(conn, user_ids=user_ids, n=1000)
        proj_ids = bulk_insert_projetos(conn, curso_ids=curso_ids, proposta_ids=prop_ids, n=200)
        bulk_insert_feedbacks(conn, user_ids=user_ids, projeto_ids=proj_ids, n=150)
        bulk_insert_projeto_aluno(conn, projeto_ids=proj_ids, user_ids=user_ids, pairs=120)
        bulk_insert_notificacoes(conn, user_ids=user_ids, n=120)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
