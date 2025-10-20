const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Enable foreign keys
  db.run(`PRAGMA foreign_keys = ON;`);

  // Usuario table
  db.run(`
    CREATE TABLE IF NOT EXISTS Usuario (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      perfil TEXT
    );
  `);

  // Notificacao table
  db.run(`
    CREATE TABLE IF NOT EXISTS Notificacao (
      id_notificacao INTEGER PRIMARY KEY AUTOINCREMENT,
      mensagem TEXT NOT NULL,
      dataNotif DATE NOT NULL,
      id_usuario INTEGER NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE
    );
  `);

  // Proposta table
  db.run(`
    CREATE TABLE IF NOT EXISTS Proposta (
      id_proposta INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data_submissao DATE NOT NULL,
      status TEXT,
      anexos BLOB,
      id_usuario INTEGER NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE
    );
  `);

  // Curso table
  db.run(`
    CREATE TABLE IF NOT EXISTS Curso (
      id_curso INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT
    );
  `);

  // Projeto table
  db.run(`
    CREATE TABLE IF NOT EXISTS Projeto (
      id_projeto INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      prazo DATE,
      status TEXT,
      feedback TEXT,
      fk_curso_id_curso INTEGER NOT NULL,
      fk_proposta_id_proposta INTEGER NOT NULL,
      FOREIGN KEY (fk_curso_id_curso) REFERENCES Curso (id_curso) ON DELETE CASCADE,
      FOREIGN KEY (fk_proposta_id_proposta) REFERENCES Proposta (id_proposta) ON DELETE CASCADE
    );
  `);

  // Feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS Feedback (
      id_feedback INTEGER PRIMARY KEY AUTOINCREMENT,
      comentario TEXT,
      anexos BLOB,
      data DATE NOT NULL,
      fk_usuario_id_usuario INTEGER NOT NULL,
      id_projeto INTEGER NOT NULL,
      FOREIGN KEY (fk_usuario_id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_projeto) REFERENCES Projeto (id_projeto) ON DELETE CASCADE
    );
  `);

  // Projeto_Aluno table
  db.run(`
    CREATE TABLE IF NOT EXISTS Projeto_Aluno (
      idprojetoaluno INTEGER PRIMARY KEY AUTOINCREMENT,
      fk_projeto_id_projeto INTEGER NOT NULL,
      id_usuario INTEGER NOT NULL,
      FOREIGN KEY (fk_projeto_id_projeto) REFERENCES Projeto (id_projeto) ON DELETE CASCADE,
      FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE
    );
  `);
});

module.exports = db;
