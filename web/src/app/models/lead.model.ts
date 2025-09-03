export interface Lead {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  fonte: LeadSource;
  status: LeadStatus;
  valorContrato?: number;
  observacoes?: string;
  produtos?: LeadProduct[];
  descontoGeral?: number;
  valorTotal?: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
}

export interface LeadProduct {
  id?: number;
  leadId?: number;
  nome: ProductName;
  valor: number;
  desconto: number;
  valorFinal: number;
}

export enum ProductName {
  EASYMAPS = 'EasyMaps',
  EASYFLOW = 'EasyFlow',
  EASYLOGS = 'EasyLogs',
  EASYREPORT = 'EasyReport',
  EASYMON = 'EasyMon',
  EASYBI = 'EasyBI'
}

export enum LeadSource {
  INDICACAO = 'INDICACAO',
  EVENTO = 'EVENTO',
  REDES_SOCIAIS = 'REDES_SOCIAIS',
  EX_CLIENTE = 'EX_CLIENTE',
  PARCEIRO = 'PARCEIRO'
}

export enum LeadStatus {
  // Etapa de Entrada
  NOVO_LEAD = 'NOVO_LEAD',
  
  // Etapa de Qualificação
  LEAD_QUALIFICADO = 'LEAD_QUALIFICADO',
  LEAD_NAO_QUALIFICADO = 'LEAD_NAO_QUALIFICADO',
  DELETADO = 'DELETADO',
  
  // Etapa de Interesse
  INTERESSE = 'INTERESSE',
  NAO_TEVE_INTERESSE = 'NAO_TEVE_INTERESSE',
  
  // Etapa de Apresentação
  APRESENTACAO_AGENDADA = 'APRESENTACAO_AGENDADA',
  NAO_PRECISOU_APRESENTACAO = 'NAO_PRECISOU_APRESENTACAO',
  NAO_FOI_POSSIVEL_AGENDAR = 'NAO_FOI_POSSIVEL_AGENDAR',
  
  // Etapa da Proposta
  PROPOSTA_ENVIADA = 'PROPOSTA_ENVIADA',
  PROPOSTA_ACEITA = 'PROPOSTA_ACEITA',
  PROPOSTA_NEGADA = 'PROPOSTA_NEGADA',
  
  // Etapa de Criação do Grupo
  AGUARDANDO_DADOS = 'AGUARDANDO_DADOS',
  DADOS_ENVIADOS = 'DADOS_ENVIADOS',
  GRUPO_CRIADO = 'GRUPO_CRIADO',
  CLIENTE_ENTROU_GRUPO = 'CLIENTE_ENTROU_GRUPO',
  CLIENTE_NAO_ENTROU_GRUPO = 'CLIENTE_NAO_ENTROU_GRUPO',
  
  // Etapa de Implementação
  AGUARDANDO_VMS = 'AGUARDANDO_VMS',
  VMS_ENVIADAS = 'VMS_ENVIADAS',
  ATIVACAO_INICIADA = 'ATIVACAO_INICIADA',
  IMPLANTADO = 'IMPLANTADO',
  
  // Etapa de Cadastro e Cobrança
  CADASTRADO_SGP = 'CADASTRADO_SGP',
  FATURADO = 'FATURADO',
  CLIENTE_ANTIGO = 'CLIENTE ANTIGO',
  
  // Estados Especiais
  ARMAZENADO_FUTURO = 'ARMAZENADO_FUTURO',
  COBRAR = 'COBRAR'
}

export interface Interaction {
  id?: number;
  leadId: number;
  tipo: InteractionType;
  conteudo: string;
  dataCriacao: Date;
  usuarioCriacao: string;
}

export enum InteractionType {
  CONTATO_INICIAL = 'CONTATO_INICIAL',
  QUALIFICACAO = 'QUALIFICACAO',
  APRESENTACAO = 'APRESENTACAO',
  PROPOSTA = 'PROPOSTA',
  COBRANCA = 'COBRANCA',
  IMPLEMENTACAO = 'IMPLEMENTACAO',
  OUTRO = 'OUTRO'
}

export interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  role: UserRole;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USUARIO = 'USUARIO'
}

export interface Webhook {
  id?: number;
  nome: string;
  url: string;
  ativo: boolean;
  eventos: WebhookEvent[];
  configuracaoEventos: WebhookEventConfig[];
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface WebhookEventConfig {
  evento: WebhookEvent;
  ativo: boolean;
  dadosEnviados: WebhookDataField[];
}

export interface WebhookDataField {
  campo: string;
  label: string;
  ativo: boolean;
  obrigatorio: boolean;
}

export enum WebhookEvent {
  LEAD_CRIADO = 'LEAD_CRIADO',
  LEAD_ATUALIZADO = 'LEAD_ATUALIZADO',
  LEAD_DELETADO = 'LEAD_DELETADO',
  INTERACAO_CRIADA = 'INTERACAO_CRIADA',
  STATUS_ALTERADO = 'STATUS_ALTERADO',
  VALOR_PROPOSTA_ALTERADO = 'VALOR_PROPOSTA_ALTERADO'
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DashboardStats {
  totalLeads: number;
  leadsNovos: number;
  leadsQualificados: number;
  leadsInteressados: number;
  leadsImplantados: number;
  leadsFaturados: number;
  leadsArmazenados: number;
  conversaoRate: number;
}
