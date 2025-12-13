/**
 * ============================================
 * REDE BAIANA - TIPOS E INTERFACES
 * Simulador de Infraestrutura de Rede
 * ============================================
 */

// ============================================
// TIPOS DE DISPOSITIVOS DE REDE
// ============================================

export enum TipoDispositivo {
  HOST = 'HOST',           // Computador/Servidor
  ROTEADOR = 'ROTEADOR',   // Roteador
  SWITCH = 'SWITCH',       // Switch
  HUB = 'HUB',             // Hub
  FIREWALL = 'FIREWALL',   // Firewall
  SERVIDOR = 'SERVIDOR',   // Servidor
}

export enum StatusDispositivo {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  CONGESTIONADO = 'CONGESTIONADO',
  MANUTENCAO = 'MANUTENCAO',
  COMPROMETIDO = 'COMPROMETIDO', // Sob ataque
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

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Representa um dispositivo na rede (Vértice do Grafo)
 */
export interface Dispositivo {
  id: string;
  nome: string;
  tipo: TipoDispositivo;
  status: StatusDispositivo;
  ip: string;
  mac: string;
  x: number; // Posição X no canvas
  y: number; // Posição Y no canvas
  capacidadeProcessamento: number; // 1-100
  cargaAtual: number; // 0-100
  pacotesProcessados: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Representa uma conexão entre dispositivos (Aresta do Grafo)
 */
export interface Conexao {
  id: string;
  origem: string;    // ID do dispositivo origem
  destino: string;   // ID do dispositivo destino
  tipo: TipoConexao;
  status: StatusConexao;
  latencia: number;      // ms
  banda: number;         // Mbps
  bandaUsada: number;    // Mbps em uso
  perda: number;         // % de perda de pacotes
  peso: number;          // Peso calculado para algoritmos
  bidirecional: boolean; // Se a conexão é nos dois sentidos
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Representa um pacote de dados trafegando na rede
 */
export interface Pacote {
  id: string;
  origem: string;
  destino: string;
  tamanho: number;      // KB
  prioridade: number;   // 1-10
  ttl: number;          // Time to live
  rota: string[];       // IDs dos dispositivos no caminho
  rotaPercorrida: string[];
  status: 'ENVIANDO' | 'ENTREGUE' | 'PERDIDO' | 'TIMEOUT';
  tempoInicio: Date;
  tempoFim?: Date;
}

/**
 * Tipos de ataques simulados
 */
export enum TipoAtaque {
  DOS = 'DOS',           // Denial of Service
  DDOS = 'DDOS',         // Distributed DoS
  MALWARE = 'MALWARE',   // Propagação de malware
  MAN_IN_MIDDLE = 'MAN_IN_MIDDLE', // Interceptação
  ROTEADOR_MALICIOSO = 'ROTEADOR_MALICIOSO',
}

export interface Ataque {
  id: string;
  tipo: TipoAtaque;
  alvos: string[];       // IDs dos dispositivos afetados
  intensidade: number;   // 1-100
  propagacao: boolean;   // Se está se espalhando
  ativo: boolean;
  iniciadoEm: Date;
}

/**
 * Métricas da rede
 */
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
}

/**
 * Resultado de busca de caminho
 */
export interface ResultadoCaminho {
  encontrado: boolean;
  caminho: string[];
  custoTotal: number;
  distancia: number;
  latenciaEstimada: number;
  saltos: number;
  algoritmoUsado: 'DIJKSTRA' | 'BFS' | 'DFS' | 'BELLMAN_FORD';
}

/**
 * Resultado de análise de componentes conectados
 */
export interface ComponenteConectado {
  id: number;
  dispositivos: string[];
  tamanho: number;
  isolado: boolean;
}

/**
 * Estado completo da rede
 */
export interface EstadoRede {
  dispositivos: Dispositivo[];
  conexoes: Conexao[];
  pacotesAtivos: Pacote[];
  ataques: Ataque[];
  metricas: MetricasRede;
  timestamp: Date;
}

/**
 * Evento de log da rede
 */
export interface LogEvento {
  id: string;
  timestamp: Date;
  tipo: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'ATTACK';
  mensagem: string;
  dispositivos?: string[];
  detalhes?: Record<string, unknown>;
}

