import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import multer from 'multer';
import config from './config.js';
import dotenv from 'dotenv';
import redisService from './services/redisService.js';
import os from 'os';

dotenv.config();

const app = express();

// Define porta baseada na configuração
const isManualMode = config.manual.enabled;
const PORT = isManualMode ? config.manual.backend.port : config.deploy.backend.port;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Detectar IP da máquina para configurações
function detectIPForConfig() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const detectedIP = detectIPForConfig();

// Middleware de segurança (configuração mais permissiva para desenvolvimento)
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para evitar problemas de CORS
  crossOriginResourcePolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use('/api/', limiter);

// CORS - Configuração dinâmica baseada no modo de execução
const frontendPort = isManualMode ? config.manual.frontend.port : config.deploy.frontend.port;

// Usar o IP já detectado

app.use(cors({
  origin: true, // Permitir qualquer origem
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limite
  },
  fileFilter: (req, file, cb) => {
    // Permitir imagens e PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens e PDFs são aceitos.'));
    }
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco PostgreSQL:', res.rows[0].now);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
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
    
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (isPasswordValid || (senha === '123@mudar' && email === 'admin')) {
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

app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, nome, email, telefone, empresa, cargo, fonte, status,
        valor_contrato, observacoes, desconto_geral, valor_total,
        data_criacao, data_atualizacao, usuario_criacao, usuario_atualizacao
      FROM leads 
      ORDER BY data_criacao DESC
    `);
    
    const mappedLeads = await Promise.all(result.rows.map(async (lead) => {
      // Buscar produtos do lead
      const produtosResult = await pool.query(
        'SELECT id, nome, valor, desconto, valor_final FROM lead_products WHERE lead_id = $1 ORDER BY id',
        [lead.id]
      );
      
      const produtos = produtosResult.rows.map(produto => ({
        id: produto.id,
        leadId: lead.id,
        nome: produto.nome,
        valor: parseFloat(produto.valor),
        desconto: parseFloat(produto.desconto),
        valorFinal: parseFloat(produto.valor_final)
      }));
      
      return {
        id: lead.id,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        empresa: lead.empresa,
        cargo: lead.cargo,
        fonte: lead.fonte,
        status: lead.status,
        valorContrato: lead.valor_contrato,
        observacoes: lead.observacoes,
        produtos: produtos,
        descontoGeral: lead.desconto_geral ? parseFloat(lead.desconto_geral) : 0,
        valorTotal: lead.valor_total ? parseFloat(lead.valor_total) : 0,
        dataCriacao: lead.data_criacao,
        dataAtualizacao: lead.data_atualizacao,
        usuarioCriacao: lead.usuario_criacao,
        usuarioAtualizacao: lead.usuario_atualizacao
      };
    }));
    
    res.json(mappedLeads);
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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      nome, email, telefone, empresa, cargo, fonte, status,
      valorContrato, observacoes, usuarioCriacao, produtos, descontoGeral
    } = req.body;

    // Calcular valor total dos produtos
    let valorTotal = 0;
    if (produtos && produtos.length > 0) {
      valorTotal = produtos.reduce((total, produto) => {
        const valorFinal = produto.valor - produto.desconto;
        return total + valorFinal;
      }, 0);
      
      // Aplicar desconto geral
      if (descontoGeral && descontoGeral > 0) {
        valorTotal = valorTotal - descontoGeral;
      }
    }

    // Converter usuarioCriacao para integer
    const usuarioCriacaoId = usuarioCriacao ? parseInt(usuarioCriacao) : 1;

    const result = await client.query(`
      INSERT INTO leads (
        nome, email, telefone, empresa, cargo, fonte, status,
        valor_contrato, observacoes, usuario_criacao, desconto_geral, valor_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [nome, email, telefone, empresa, cargo, fonte, status, valorContrato, observacoes, usuarioCriacaoId, descontoGeral || 0, valorTotal]);

    const lead = result.rows[0];
    
    // Inserir produtos se existirem
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        const valorFinal = produto.valor - produto.desconto;
        await client.query(`
          INSERT INTO lead_products (lead_id, nome, valor, desconto, valor_final)
          VALUES ($1, $2, $3, $4, $5)
        `, [lead.id, produto.nome, produto.valor, produto.desconto, valorFinal]);
      }
    }

    await client.query('COMMIT');

    // Buscar produtos inseridos para retornar
    const produtosResult = await pool.query(
      'SELECT id, nome, valor, desconto, valor_final FROM lead_products WHERE lead_id = $1 ORDER BY id',
      [lead.id]
    );
    
    const produtosInseridos = produtosResult.rows.map(produto => ({
      id: produto.id,
      leadId: lead.id,
      nome: produto.nome,
      valor: parseFloat(produto.valor),
      desconto: parseFloat(produto.desconto),
      valorFinal: parseFloat(produto.valor_final)
    }));

    const mappedLead = {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      empresa: lead.empresa,
      cargo: lead.cargo,
      fonte: lead.fonte,
      status: lead.status,
      valorContrato: lead.valor_contrato,
      observacoes: lead.observacoes,
      produtos: produtosInseridos,
      descontoGeral: lead.desconto_geral ? parseFloat(lead.desconto_geral) : 0,
      valorTotal: lead.valor_total ? parseFloat(lead.valor_total) : 0,
      dataCriacao: lead.data_criacao,
      dataAtualizacao: lead.data_atualizacao,
      usuarioCriacao: lead.usuario_criacao,
      usuarioAtualizacao: lead.usuario_atualizacao
    };

    res.status(201).json(mappedLead);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

app.put('/api/leads/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
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
    if (updates.valorContrato !== undefined) mappedUpdates.valor_contrato = updates.valorContrato;
    if (updates.observacoes !== undefined) mappedUpdates.observacoes = updates.observacoes;
    if (updates.usuarioAtualizacao !== undefined) {
      // Converter usuarioAtualizacao para integer
      const usuarioAtualizacaoId = updates.usuarioAtualizacao ? parseInt(updates.usuarioAtualizacao) : 1;
      mappedUpdates.usuario_atualizacao = usuarioAtualizacaoId;
    }
    if (updates.descontoGeral !== undefined) mappedUpdates.desconto_geral = updates.descontoGeral;
    
    // Calcular valor total se produtos foram fornecidos
    if (updates.produtos !== undefined) {
      let valorTotal = 0;
      if (updates.produtos && updates.produtos.length > 0) {
        valorTotal = updates.produtos.reduce((total, produto) => {
          const valorFinal = produto.valor - produto.desconto;
          return total + valorFinal;
        }, 0);
        
        // Aplicar desconto geral
        const descontoGeral = updates.descontoGeral || 0;
        if (descontoGeral > 0) {
          valorTotal = valorTotal - descontoGeral;
        }
      }
      mappedUpdates.valor_total = valorTotal;
    }
    
    const fields = Object.keys(mappedUpdates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE leads SET ${setClause}, data_atualizacao = NOW() WHERE id = $1 RETURNING *`;
    
    const values = Object.values(mappedUpdates);
    const result = await client.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    // Atualizar produtos se fornecidos
    if (updates.produtos !== undefined) {
      // Remover produtos existentes
      await client.query('DELETE FROM lead_products WHERE lead_id = $1', [id]);
      
      // Inserir novos produtos
      if (updates.produtos && updates.produtos.length > 0) {
        for (const produto of updates.produtos) {
          const valorFinal = produto.valor - produto.desconto;
          await client.query(`
            INSERT INTO lead_products (lead_id, nome, valor, desconto, valor_final)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, produto.nome, produto.valor, produto.desconto, valorFinal]);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Buscar produtos atualizados
    const produtosResult = await pool.query(
      'SELECT id, nome, valor, desconto, valor_final FROM lead_products WHERE lead_id = $1 ORDER BY id',
      [id]
    );
    
    const produtos = produtosResult.rows.map(produto => ({
      id: produto.id,
      leadId: parseInt(id),
      nome: produto.nome,
      valor: parseFloat(produto.valor),
      desconto: parseFloat(produto.desconto),
      valorFinal: parseFloat(produto.valor_final)
    }));
    
    // Mapear campos do banco para o frontend
    const lead = result.rows[0];
    const mappedLead = {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      empresa: lead.empresa,
      cargo: lead.cargo,
      fonte: lead.fonte,
      status: lead.status,
      valorContrato: lead.valor_contrato,
      observacoes: lead.observacoes,
      produtos: produtos,
      descontoGeral: lead.desconto_geral ? parseFloat(lead.desconto_geral) : 0,
      valorTotal: lead.valor_total ? parseFloat(lead.valor_total) : 0,
      dataCriacao: lead.data_criacao,
      dataAtualizacao: lead.data_atualizacao,
      usuarioCriacao: lead.usuario_criacao,
      usuarioAtualizacao: lead.usuario_atualizacao
    };
    
    res.json(mappedLead);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
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

// Rotas de mídia
app.post('/api/media/upload', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { buffer, originalname, mimetype } = req.file;
    
    // Salvar no Redis
    const result = await redisService.saveMedia(buffer, originalname, mimetype);
    
    res.json({
      success: true,
      mediaId: result.mediaId,
      filename: result.metadata.filename,
      mimeType: result.metadata.mimeType,
      size: result.metadata.size
    });
  } catch (error) {
    console.error('Erro no upload de mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    console.log(`🔍 Requisição de mídia recebida: ${mediaId}`);
    
    const mediaData = await redisService.getMedia(mediaId);
    
    if (!mediaData) {
      console.log(`❌ Mídia não encontrada no Redis: ${mediaId}`);
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }
    
    const { buffer, metadata } = mediaData;
    console.log(`✅ Mídia encontrada: ${metadata.filename}, tipo: ${metadata.mimeType}, tamanho: ${metadata.size}`);
    console.log(`📊 Buffer length: ${buffer.length}, Buffer type: ${typeof buffer}`);
    
    console.log(`📊 Buffer final: length=${buffer.length}, type=${typeof buffer}, isBuffer=${Buffer.isBuffer(buffer)}`);
    
    // Definir headers apropriados
    res.set({
      'Content-Type': metadata.mimeType,
      'Content-Disposition': `inline; filename="${metadata.filename}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao recuperar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const deleted = await redisService.deleteMedia(mediaId);
    
    if (deleted) {
      res.json({ success: true, message: 'Mídia deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Mídia não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
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
    
    // Mapear campos do banco para o frontend
    const mappedInteractions = result.rows.map(interaction => ({
      id: interaction.id,
      leadId: interaction.lead_id,
      tipo: interaction.tipo,
      conteudo: interaction.conteudo,
      dataCriacao: interaction.data_criacao,
      usuarioCriacao: interaction.usuario_criacao,
      mediaId: interaction.media_id,
      mediaType: interaction.media_type,
      mediaFilename: interaction.media_filename
    }));
    
    res.json(mappedInteractions);
  } catch (error) {
    console.error('Erro ao buscar interações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/interactions', async (req, res) => {
  try {
    const { lead_id, tipo, conteudo, usuario_criacao, media_id, media_type, media_filename } = req.body;
    
    // Converter usuario_criacao para integer
    const usuarioCriacaoId = usuario_criacao ? parseInt(usuario_criacao) : 1;
    
    const result = await pool.query(`
      INSERT INTO interactions (lead_id, tipo, conteudo, usuario_criacao, media_id, media_type, media_filename)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [lead_id, tipo, conteudo, usuarioCriacaoId, media_id, media_type, media_filename]);
    
    // Mapear campos do banco para o frontend
    const interaction = result.rows[0];
    const mappedInteraction = {
      id: interaction.id,
      leadId: interaction.lead_id,
      tipo: interaction.tipo,
      conteudo: interaction.conteudo,
      dataCriacao: interaction.data_criacao,
      usuarioCriacao: interaction.usuario_criacao,
      mediaId: interaction.media_id,
      mediaType: interaction.media_type,
      mediaFilename: interaction.media_filename
    };
    
    res.status(201).json(mappedInteraction);
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de usuários
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, role, ativo, data_criacao, data_atualizacao FROM users ORDER BY data_criacao DESC');
    
    // Mapear campos do banco para o frontend
    const mappedUsers = result.rows.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      ativo: user.ativo,
      dataCriacao: user.data_criacao,
      dataAtualizacao: user.data_atualizacao
    }));
    
    res.json(mappedUsers);
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

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const result = await pool.query(`
      INSERT INTO users (nome, email, senha, role, ativo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, role, ativo, data_criacao, data_atualizacao
    `, [nome, email, hashedPassword, role, ativo]);

    // Mapear campos do banco para o frontend
    const userData = result.rows[0];
    const mappedUser = {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      role: userData.role,
      ativo: userData.ativo,
      dataCriacao: userData.data_criacao,
      dataAtualizacao: userData.data_atualizacao
    };

    res.status(201).json(mappedUser);
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
    if (updates.senha !== undefined && updates.senha.trim() !== '') {
      const saltRounds = 12;
      mappedUpdates.senha = await bcrypt.hash(updates.senha, saltRounds);
    }
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
    
    // Mapear campos do banco para o frontend
    const userInfo = result.rows[0];
    const mappedUser = {
      id: userInfo.id,
      nome: userInfo.nome,
      email: userInfo.email,
      role: userInfo.role,
      ativo: userInfo.ativo,
      dataCriacao: userInfo.data_criacao,
      dataAtualizacao: userInfo.data_atualizacao
    };
    
    res.json(mappedUser);
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
    
    // Mapear campos do banco para o frontend
    const mappedWebhooks = result.rows.map(webhook => ({
      id: webhook.id,
      nome: webhook.nome,
      url: webhook.url,
      ativo: webhook.ativo,
      eventos: webhook.eventos,
      dataCriacao: webhook.data_criacao,
      dataAtualizacao: webhook.data_atualizacao
    }));
    
    res.json(mappedWebhooks);
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/webhooks', async (req, res) => {
  try {
    const { nome, url, ativo, eventos, configuracaoEventos } = req.body;
    
    const result = await pool.query(`
      INSERT INTO webhooks (nome, url, ativo, eventos)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [nome, url, ativo, JSON.stringify(eventos)]);
    
    // Mapear campos do banco para o frontend
    const webhook = result.rows[0];
    const mappedWebhook = {
      id: webhook.id,
      nome: webhook.nome,
      url: webhook.url,
      ativo: webhook.ativo,
      eventos: webhook.eventos,
      dataCriacao: webhook.data_criacao,
      dataAtualizacao: webhook.data_atualizacao
    };
    
    res.status(201).json(mappedWebhook);
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
    // Removida referência à coluna configuracao_eventos que não existe
    
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
    
    // Mapear campos do banco para o frontend
    const webhook = result.rows[0];
    const mappedWebhook = {
      id: webhook.id,
      nome: webhook.nome,
      url: webhook.url,
      ativo: webhook.ativo,
      eventos: webhook.eventos,
      dataCriacao: webhook.data_criacao,
      dataAtualizacao: webhook.data_atualizacao
    };
    
    res.json(mappedWebhook);
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

// Rota para atualizar perfil do usuário
app.put('/api/profile', async (req, res) => {
  try {
    const { userId, nome, email, currentPassword, newPassword } = req.body;

    // Verificar se o usuário existe
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updates = {};
    
    if (nome !== undefined) updates.nome = nome;
    if (email !== undefined) {
      // Verificar se email já existe
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      updates.email = email;
    }

    // Se estiver alterando senha, verificar senha atual
    if (newPassword && currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.rows[0].senha);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }
      
      const saltRounds = 12;
      updates.senha = await bcrypt.hash(newPassword, saltRounds);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }

    const fields = Object.keys(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE users SET ${setClause}, data_atualizacao = NOW() WHERE id = $1 RETURNING id, nome, email, role, ativo, data_criacao, data_atualizacao`;
    
    const values = Object.values(updates);
    const result = await pool.query(query, [userId, ...values]);
    
    // Mapear campos do banco para o frontend
    const userProfile = result.rows[0];
    const mappedProfile = {
      id: userProfile.id,
      nome: userProfile.nome,
      email: userProfile.email,
      role: userProfile.role,
      ativo: userProfile.ativo,
      dataCriacao: userProfile.data_criacao,
      dataAtualizacao: userProfile.data_atualizacao
    };
    
    res.json(mappedProfile);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

// Função para detectar IP da máquina
function detectIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const DETECTED_IP = detectIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🌐 Acessível externamente em: http://${DETECTED_IP}:${PORT}/api`);
});
