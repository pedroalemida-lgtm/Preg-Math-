// ============================================================
// CONFIGURAÇÃO DO BANCO DE DADOS PostgreSQL
// Suporta tanto DATABASE_URL (Supabase/produção)
// quanto variáveis individuais (desenvolvimento local)
// ============================================================

require('dotenv').config();

const { Pool } = require('pg');

// ============================================================
// CONFIGURAR O POOL DE CONEXÕES
// Em produção (Supabase/Vercel): usa DATABASE_URL
// Em desenvolvimento local: usa variáveis individuais
// ============================================================

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Necessário para Supabase
      },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 5432,
    };

const pool = new Pool(poolConfig);

// ============================================================
// TESTAR CONEXÃO
// ============================================================

pool.connect((erro, client, release) => {
  if (erro) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', erro.message);
    console.error('💡 Verifique suas credenciais no arquivo .env');
  } else {
    const host = process.env.DATABASE_URL
      ? 'Supabase (DATABASE_URL)'
      : `${process.env.DB_HOST}:${process.env.DB_PORT}`;
    console.log('✅ Conectado ao PostgreSQL!');
    console.log(`📊 Banco: ${process.env.DB_NAME || 'postgres'}`);
    console.log(`🏠 Host: ${host}`);
    release();
  }
});

// ============================================================
// EXPORTAR O POOL
// ============================================================

module.exports = pool;
