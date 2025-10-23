const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  database: process.env.PGDATABASE || process.env.DB_NAME || 'fatec-conecta',
  user: process.env.PGUSER || process.env.DB_USER || 'dev',
  password: process.env.PGPASSWORD || process.env.DB_PASS || 'secret',
});

pool
  .query('SELECT 1')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error:', err.message));

function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const idColumnByTable = {
  Usuario: 'id_usuario',
  Curso: 'id_curso',
  Proposta: 'id_proposta',
  Projeto: 'id_projeto',
  Feedback: 'id_feedback',
  Notificacao: 'id_notificacao',
  Projeto_Aluno: 'idprojetoaluno',
};

function run(sql, params, cb) {
  const isInsert = /^\s*insert\s+into\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(sql);
  let returningId = null;
  let finalSql = sql;
  if (isInsert && !/returning\s+/i.test(sql)) {
    const table = isInsert[1];
    const idCol = idColumnByTable[table];
    if (idCol) {
      finalSql = `${sql} RETURNING ${idCol}`;
      returningId = idCol;
    }
  }
  const text = convertPlaceholders(finalSql);
  pool
    .query({ text, values: params || [] })
    .then((res) => {
      const ctx = {
        lastID: returningId && res.rows && res.rows[0] ? res.rows[0][returningId] : undefined,
        changes: res.rowCount,
      };
      if (typeof cb === 'function') cb.call(ctx, null);
    })
    .catch((err) => {
      if (typeof cb === 'function') cb.call({}, err);
    });
}

function get(sql, params, cb) {
  const text = convertPlaceholders(sql);
  pool
    .query({ text, values: params || [] })
    .then((res) => cb && cb(null, res.rows[0]))
    .catch((err) => cb && cb(err));
}

function all(sql, params, cb) {
  const text = convertPlaceholders(sql);
  pool
    .query({ text, values: params || [] })
    .then((res) => cb && cb(null, res.rows))
    .catch((err) => cb && cb(err));
}

module.exports = { run, get, all };
