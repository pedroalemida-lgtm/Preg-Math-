const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// ============================================================
// FUNÇÃO: login
// ROTA: POST /auth/login
// DESCRIÇÃO:
// Autenticação com banco de dados PostgreSQL (admin_user)
// e validação de hash com bcryptjs (conforme Guia do Hub do Conhecimento).
// Possui fallback para variáveis de ambiente (.env) caso a tabela
// ainda não tenha sido criada no Supabase.
// ============================================================
async function login(req, res) {
  // Suporta tanto 'usuario'/'senha' quanto 'email'/'password'
  const usuario = req.body.usuario || req.body.email;
  const senha = req.body.senha || req.body.password;

  if (!usuario || !senha) {
    return res.status(400).json({
      erro: 'Informe usuário e senha.',
      mensagem: 'Informe usuário e senha.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_jwt_default';

    // 1. Tentar buscar no banco de dados (tabela admin_user)
    try {
      const resultado = await pool.query(
        'SELECT * FROM admin_user WHERE usuario = $1',
        [usuario]
      );

      if (resultado.rows.length > 0) {
        const admin = resultado.rows[0];

        // Compara a senha informada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
        if (!senhaValida) {
          return res.status(401).json({
            erro: 'Credenciais inválidas.',
            mensagem: 'Credenciais inválidas.'
          });
        }

        // Gera token JWT de sessão
        const token = jwt.sign(
          { id: admin.id, usuario: admin.usuario, role: 'admin' },
          secret,
          { expiresIn: '2h' }
        );

        return res.json({
          mensagem: 'Autenticação realizada com sucesso!',
          token,
          user: {
            id: admin.id,
            name: admin.usuario,
            email: admin.usuario,
            usuario: admin.usuario,
            role: 'admin'
          }
        });
      }
    } catch (dbError) {
      // Se a tabela admin_user ainda não existir no banco, continua para o fallback
      console.warn('⚠️ Consulta admin_user falhou (ou tabela inexistente), usando fallback do .env:', dbError.message);
    }

    // 2. Fallback: autenticação por variáveis de ambiente (.env)
    const authUser = process.env.AUTH_USER;
    const authPassword = process.env.AUTH_PASSWORD;

    if (authUser && authPassword && usuario === authUser && senha === authPassword) {
      const token = jwt.sign(
        { email: authUser, role: 'admin' },
        secret,
        { expiresIn: '2h' }
      );

      return res.status(200).json({
        mensagem: 'Autenticação realizada com sucesso!',
        token,
        user: {
          id: 1,
          name: 'Administrador',
          email: authUser,
          usuario: authUser,
          role: 'admin'
        }
      });
    }

    // Se nenhum método coincidiu
    return res.status(401).json({
      erro: 'Credenciais inválidas.',
      mensagem: 'Credenciais inválidas.'
    });

  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({
      erro: 'Erro interno do servidor.',
      mensagem: 'Erro interno do servidor.'
    });
  }
}

module.exports = {
  login,
};
