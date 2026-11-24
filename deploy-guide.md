# 🚀 Guia de Implantação: Vercel + Supabase e Autenticação Segura (PregMath)

> [!IMPORTANT]
> Este guia contempla todas as etapas exigidas para o projeto prático: banco de dados PostgreSQL na nuvem (Supabase), autenticação com criptografia hash (`bcryptjs`) e publicação web na Vercel.

---

## 📋 Resumo das Etapas

1. [Etapa 1: Obter a Conexão do Supabase](#etapa-1-obter-a-conexão-do-supabase)
2. [Etapa 2: Criar as Tabelas no Supabase (SQL)](#etapa-2-criar-as-tabelas-no-supabase-sql)
3. [Etapa 3: Gerar o Hash da Senha de Administrador (bcryptjs)](#etapa-3-gerar-o-hash-da-senha-de-administrador-bcryptjs)
4. [Etapa 4: Configurar o arquivo `.env` local](#etapa-4-configurar-o-arquivo-env-local)
5. [Etapa 5: Testar Localmente](#etapa-5-testar-localmente)
6. [Etapa 6: Enviar as Alterações para o GitHub (Commit & Push)](#etapa-6-enviar-as-alterações-para-o-github-commit--push)
7. [Etapa 7: Configuração e Deploy na Vercel](#etapa-7-configuração-e-deploy-na-vercel)
8. [Etapa 8: Validação Final](#etapa-8-validação-final)

---

## Etapa 1: Obter a Conexão do Supabase

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com).
2. No menu lateral esquerdo, clique no ícone de engrenagem (**Project Settings**).
3. Selecione a opção **Database**.
4. Role a página até a seção **Connection String** e escolha a aba **URI** (modo Transaction, porta **6543**).
5. Copie a string de conexão, que terá o formato:
   ```text
   postgresql://postgres.[PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
   > ⚠️ **Atenção:** Substitua `[SUA-SENHA]` pela senha que você definiu ao criar o projeto no Supabase.

---

## Etapa 2: Criar as Tabelas no Supabase (SQL)

No painel do Supabase, acesse **SQL Editor → New query**, cole o código abaixo e clique em **Run**:

```sql
-- 1. Tabela de Usuário Administrativo (Autenticação Segura com Hash)
CREATE TABLE IF NOT EXISTS admin_user (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL
);

-- 2. Tabela de Questões
CREATE TABLE IF NOT EXISTS questoes (
  id SERIAL PRIMARY KEY,
  tema VARCHAR(255) NOT NULL,
  enunciado TEXT NOT NULL,
  alternativas JSONB,
  gabarito VARCHAR(10),
  fonte VARCHAR(255),
  ano INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para otimizar busca por tema
CREATE INDEX IF NOT EXISTS idx_questoes_tema ON questoes(tema);
```

---

## Etapa 3: Gerar o Hash da Senha de Administrador (bcryptjs)

No seu terminal, gere o hash da senha que o administrador usará para fazer login:

```bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA_AQUI', 10))"
```

*Exemplo de saída:* `$2a$10$e8wB...c9yQZ...`

Volte ao **SQL Editor** do Supabase e insira o usuário com o hash gerado:

```sql
INSERT INTO admin_user (usuario, senha_hash)
VALUES ('admin@pregmath.com', 'COLE_AQUI_O_HASH_GERADO_NO_TERMINAL');
```

---

## Etapa 4: Configurar o arquivo `.env` local

No seu arquivo `.env` na raiz do projeto (este arquivo **nunca** vai para o Git):

```env
PORT=3000
NODE_ENV=development

# URL copiada da Etapa 1
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Credenciais de contingência
AUTH_USER=admin@pregmath.com
AUTH_PASSWORD=SUA_SENHA_AQUI

# Chave secreta de sessão JWT (já gerada)
JWT_SECRET=00a53e6460117b07be53fafd92fb457662c184e70c44d6029c39664dab3ffed0bb9f2629edf9bde0839ba4825e79b9923ff0196d071102ee2992e1e2aa4e750a
```

---

## Etapa 5: Testar Localmente

Abra dois terminais na raiz do projeto:

**Terminal 1 (Backend):**
```bash
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run client:dev
```

Acesse no navegador:
- Aplicação: http://localhost:5173
- Teste de login com as credenciais cadastradas

---

## Etapa 6: Enviar as Alterações para o GitHub (Commit & Push)

No terminal na raiz do projeto:

```bash
# 1. Verifique os arquivos alterados
git status

# 2. Adicione todos os arquivos versionados
git add .

# 3. Faça o commit
git commit -m "feat: integração supabase, autenticação com bcryptjs e suporte a deploy vercel"

# 4. Envie para o GitHub
git push origin main
```

> 🔒 O arquivo `.env` está no `.gitignore` e não será enviado ao GitHub.

---

## Etapa 7: Configuração e Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e conecte com seu GitHub.
2. Clique em **Add New... → Project** e selecione o repositório **PregMath**.
3. Na seção **Environment Variables**, adicione as seguintes variáveis:
   - `DATABASE_URL`: *(a mesma URL de conexão do Supabase, porta 6543)*
   - `JWT_SECRET`: *(o mesmo valor de JWT_SECRET do seu .env)*
   - `NODE_ENV`: `production`
4. Clique em **Deploy**.

---

## Etapa 8: Validação Final

Após o término do deploy pela Vercel:
1. Abra a URL gerada (exemplo: `https://pregmath-xxx.vercel.app`).
2. Realize o login no formulário com o usuário e a senha cadastrados.
3. Navegue pelas seções (Temas, Questões, Simulados, Videoaulas) para garantir que todas as rotas e a API estão respondendo com sucesso!
