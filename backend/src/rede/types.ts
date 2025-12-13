/**
 * ============================================
 * REDE BAIANA - TIPOS (Backend)
 * ============================================
 */

export enum TipoDispositivo {
  HOST = 'HOST',
  ROTEADOR = 'ROTEADOR',
  SWITCH = 'SWITCH',
  HUB = 'HUB',
  FIREWALL = 'FIREWALL',
  SERVIDOR = 'SERVIDOR',
}

export enum StatusDispositivo {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  CONGESTIONADO = 'CONGESTIONADO',
  MANUTENCAO = 'MANUTENCAO',
  COMPROMETIDO = 'COMPROMETIDO',
}

export enum TipoConexao {
  ETHERNET = 'ETHERNET',
  FIBRA = 'FIBRA',
  WIRELESS = 'WIRELESS',
  VPN = 'VPN',
}

export enum StatusConexao {
  ATIVA = 'ATIVA',
  INATIVA = 'INATIVA',
  CONGESTIONADA = 'CONGESTIONADA',
  COMPROMETIDA = 'COMPROMETIDA',
}

export interface Dispositivo {
  id: string;
  nome: string;
  tipo: TipoDispositivo;
  status: StatusDispositivo;
  ip: string;
  mac: string;
  x: number;
  y: number;
  capacidadeProcessamento: number;
  cargaAtual: number;
  pacotesProcessados: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Conexao {
  id: string;
  origem: string;
  destino: string;
  tipo: TipoConexao;
  status: StatusConexao;
  latencia: number;
  banda: number;
  bandaUsada: number;
  perda: number;
  peso: number;
  custo: number;                    // Custo monetário da conexão
  estabilidade: number;             // 0-100% estabilidade
  probabilidadeFalha: number;       // 0-100% chance de falha
  bidirecional: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Pacote {
  id: string;
  origem: string;
  destino: string;
  tamanho: number;
  prioridade: number;
  ttl: number;
  rota: string[];
  rotaPercorrida: string[];
  status: 'ENVIANDO' | 'ENTREGUE' | 'PERDIDO' | 'TIMEOUT';
  tempoInicio: Date;
  tempoFim?: Date;
}

export enum TipoAtaque {
  DOS = 'DOS',
  DDOS = 'DDOS',
  MALWARE = 'MALWARE',
  MAN_IN_MIDDLE = 'MAN_IN_MIDDLE',
  ROTEADOR_MALICIOSO = 'ROTEADOR_MALICIOSO',
}

export interface Ataque {
  id: string;
  tipo: TipoAtaque;
  alvos: string[];
  intensidade: number;
  propagacao: boolean;
  ativo: boolean;
  iniciadoEm: Date;
}

export interface MetricasRede {
  totalDispositivos: number;
  dispositivosOnline: number;
  dispositivosOffline: number;
  totalConexoes: number;
  conexoesAtivas: number;
  pacotesEnviados: number;
  pacotesEntregues: number;
  pacotesPerdidos: number;
  latenciaMedia: number;
  throughputTotal: number;
  congestionamentos: number;
  tempoMedioRota: number;
  caminhoMedioEntreNos: number;        // Menor caminho médio
  dispositivosComprometidos: number;
  ataquesAtivos: number;
}

export interface HistoricoRede {
  timestamp: Date;
  metricas: MetricasRede;
  pacotesRoteados: number;
  falhasOcorridas: number;
}

export interface RecomendacaoRota {
  rotaOriginal: string[];
  rotasAlternativas: ResultadoCaminho[];
  motivoRecomendacao: string;
}

export interface SimulacaoBroadcast {
  origem: string;
  alcance: string[];
  tempoTotal: number;
  saltoMaximo: number;
}

export interface ResultadoCaminho {
  encontrado: boolean;
  caminho: string[];
  custoTotal: number;
  distancia: number;
  latenciaEstimada: number;
  saltos: number;
  algoritmoUsado: 'DIJKSTRA' | 'BFS' | 'DFS' | 'BELLMAN_FORD';
}

export interface ComponenteConectado {
  id: number;
  dispositivos: string[];
  tamanho: number;
  isolado: boolean;
}

export interface LogEvento {
  id: string;
  timestamp: Date;
  tipo: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'ATTACK';
  mensagem: string;
  dispositivos?: string[];
  detalhes?: Record<string, unknown>;
}

// DTOs
export interface CriarDispositivoDto {
  nome: string;
  tipo: TipoDispositivo;
  ip?: string;
  x: number;
  y: number;
  capacidadeProcessamento?: number;
}

export interface CriarConexaoDto {
  origem: string;
  destino: string;
  tipo: TipoConexao;
  latencia?: number;
  banda?: number;
  custo?: number;
  estabilidade?: number;
  probabilidadeFalha?: number;
  bidirecional?: boolean;
}

export interface SimularQuedaEnergiaDto {
  dispositivos: string[];
}

export interface AtualizarPesosDto {
  conexaoId: string;
  latencia?: number;
  banda?: number;
  custo?: number;
  probabilidadeFalha?: number;
}

export interface EnviarPacoteDto {
  origem: string;
  destino: string;
  tamanho?: number;
  prioridade?: number;
  algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS';
}

export interface SimularAtaqueDto {
  tipo: TipoAtaque;
  alvos: string[];
  intensidade?: number;
}

