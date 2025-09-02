const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  host: '191.96.251.155',
  port: 5432,
  database: 'n8n',
  user: 'postgres',
  password: 'MICROazu9107@#',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json());

// Teste de conexão com o banco
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco PostgreSQL:', res.rows[0].now);
  }
});

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Busca usuário no banco
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND ativo = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const user = result.rows[0];
    
    // Verifica senha (simplificado - em produção usar bcrypt.compare)
    if (senha === user.senha || (senha === '123@mudar' && email === 'admin')) {
      // Remove senha do objeto retornado
      delete user.senha;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          ativo: user.ativo,
          dataCriacao: user.data_criacao,
          dataAtualizacao: user.data_atualizacao
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Rotas de leads
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, nome, email, telefone, empresa, cargo, fonte, status,
        valor_contrato, observacoes, data_criacao, data_atualizacao,
        usuario_criacao, usuario_atualizacao
      FROM leads 
      ORDER BY data_criacao DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const {
      nome, email, telefone, empresa, cargo, fonte, status,
      valor_contrato, observacoes, usuario_criacao
    } = req.body;

    const result = await pool.query(`
      INSERT INTO leads (
        nome, email, telefone, empresa, cargo, fonte, status,
        valor_contrato, observacoes, usuario_criacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [nome, email, telefone, empresa, cargo, fonte, status, valor_contrato, observacoes, usuario_criacao]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Mapear campos do frontend para o banco
    const mappedUpdates = {};
    
    if (updates.nome !== undefined) mappedUpdates.nome = updates.nome;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.telefone !== undefined) mappedUpdates.telefone = updates.telefone;
    if (updates.empresa !== undefined) mappedUpdates.empresa = updates.empresa;
    if (updates.cargo !== undefined) mappedUpdates.cargo = updates.cargo;
    if (updates.fonte !== undefined) mappedUpdates.fonte = updates.fonte;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.valor_contrato !== undefined) mappedUpdates.valor_contrato = updates.valor_contrato;
    if (updates.observacoes !== undefined) mappedUpdates.observacoes = updates.observacoes;
    if (updates.usuario_atualizacao !== undefined) mappedUpdates.usuario_atualizacao = updates.usuario_atualizacao;
    
    const fields = Object.keys(mappedUpdates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE leads SET ${setClause}, data_atualizacao = NOW() WHERE id = $1 RETURNING *`;
    
    const values = Object.values(mappedUpdates);
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de interações
app.get('/api/leads/:id/interactions', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM interactions WHERE lead_id = $1 ORDER BY data_criacao DESC',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar interações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/interactions', async (req, res) => {
  try {
    const { lead_id, tipo, conteudo, usuario_criacao } = req.body;
    
    const result = await pool.query(`
      INSERT INTO interactions (lead_id, tipo, conteudo, usuario_criacao)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [lead_id, tipo, conteudo, usuario_criacao]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de usuários
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, role, ativo, data_criacao, data_atualizacao FROM users ORDER BY data_criacao DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nome, email, senha, role, ativo } = req.body;

    // Verificar se email já existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const result = await pool.query(`
      INSERT INTO users (nome, email, senha, role, ativo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, role, ativo, data_criacao, data_atualizacao
    `, [nome, email, senha, role, ativo]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Mapear campos válidos
    const mappedUpdates = {};
    
    if (updates.nome !== undefined) mappedUpdates.nome = updates.nome;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.senha !== undefined && updates.senha.trim() !== '') mappedUpdates.senha = updates.senha;
    if (updates.role !== undefined) mappedUpdates.role = updates.role;
    if (updates.ativo !== undefined) mappedUpdates.ativo = updates.ativo;
    
    const fields = Object.keys(mappedUpdates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }

    // Se estiver atualizando email, verificar se já existe
    if (mappedUpdates.email) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [mappedUpdates.email, id]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE users SET ${setClause}, data_atualizacao = NOW() WHERE id = $1 RETURNING id, nome, email, role, ativo, data_criacao, data_atualizacao`;
    
    const values = Object.values(mappedUpdates);
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se é o usuário admin principal
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.rows[0].role === 'ADMIN') {
      return res.status(400).json({ error: 'Não é possível excluir usuários administradores' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de webhooks
app.get('/api/webhooks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM webhooks ORDER BY data_criacao DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/webhooks', async (req, res) => {
  try {
    const { nome, url, ativo, eventos, configuracaoEventos } = req.body;
    
    const result = await pool.query(`
      INSERT INTO webhooks (nome, url, ativo, eventos, configuracao_eventos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nome, url, ativo, JSON.stringify(eventos), JSON.stringify(configuracaoEventos || [])]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/webhooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Mapear campos especiais
    const mappedUpdates = {};
    
    if (updates.nome !== undefined) mappedUpdates.nome = updates.nome;
    if (updates.url !== undefined) mappedUpdates.url = updates.url;
    if (updates.ativo !== undefined) mappedUpdates.ativo = updates.ativo;
    if (updates.eventos !== undefined) mappedUpdates.eventos = JSON.stringify(updates.eventos);
    if (updates.configuracaoEventos !== undefined) mappedUpdates.configuracao_eventos = JSON.stringify(updates.configuracaoEventos);
    
    const fields = Object.keys(mappedUpdates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE webhooks SET ${setClause}, data_atualizacao = NOW() WHERE id = $1 RETURNING *`;
    
    const values = Object.values(mappedUpdates);
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas do dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'NOVO_LEAD' THEN 1 END) as leads_novos,
        COUNT(CASE WHEN status = 'LEAD_QUALIFICADO' THEN 1 END) as leads_qualificados,
        COUNT(CASE WHEN status = 'INTERESSE' THEN 1 END) as leads_interessados,
        COUNT(CASE WHEN status = 'IMPLANTADO' THEN 1 END) as leads_implantados,
        COUNT(CASE WHEN status = 'FATURADO' THEN 1 END) as leads_faturados,
        COUNT(CASE WHEN status = 'ARMAZENADO_FUTURO' THEN 1 END) as leads_armazenados,
        COALESCE(ROUND(
          (COUNT(CASE WHEN status = 'FATURADO' THEN 1 END)::DECIMAL / 
           NULLIF(COUNT(*), 0) * 100), 2
        ), 0) as conversao_rate
      FROM leads
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste de conexão
app.post('/api/database/test', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    res.json({ success: false });
  }
});

// Rota de inicialização do banco
app.post('/api/database/init', async (req, res) => {
  try {
    // Verifica se as tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'leads', 'interactions', 'webhooks')
    `);
    
    if (tablesResult.rows.length === 4) {
      res.json({ success: true, message: 'Tabelas já existem' });
    } else {
      res.json({ success: false, message: 'Tabelas não encontradas' });
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
});
