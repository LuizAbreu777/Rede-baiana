/**
 * ============================================
 * REDE BAIANA - SEED DE DADOS
 * ============================================
 * 
 * Dados de demonstração para a apresentação
 * Representa uma rede de computadores da Bahia
 * 
 * Layout otimizado para canvas de 1000x700px
 */

import { TipoDispositivo, TipoConexao, CriarDispositivoDto } from './types';

/**
 * Dispositivos da Rede Baiana
 * Organizados em camadas hierárquicas
 */
export const dispositivosSeed: CriarDispositivoDto[] = [
  // ============================================
  // CAMADA 1: DATA CENTER (Topo - y: 50)
  // ============================================
  {
    nome: 'DC Salvador',
    tipo: TipoDispositivo.SERVIDOR,
    x: 450,
    y: 50,
    capacidadeProcessamento: 100,
    ip: '10.0.0.1',
  },
  {
    nome: 'Firewall',
    tipo: TipoDispositivo.FIREWALL,
    x: 450,
    y: 140,
    capacidadeProcessamento: 95,
    ip: '10.0.0.2',
  },

  // ============================================
  // CAMADA 2: ROTEADORES REGIONAIS (y: 250)
  // ============================================
  {
    nome: 'Roteador Salvador',
    tipo: TipoDispositivo.ROTEADOR,
    x: 200,
    y: 250,
    capacidadeProcessamento: 85,
    ip: '10.1.0.1',
  },
  {
    nome: 'Roteador Feira',
    tipo: TipoDispositivo.ROTEADOR,
    x: 450,
    y: 250,
    capacidadeProcessamento: 80,
    ip: '10.2.0.1',
  },
  {
    nome: 'Roteador Conquista',
    tipo: TipoDispositivo.ROTEADOR,
    x: 700,
    y: 250,
    capacidadeProcessamento: 75,
    ip: '10.3.0.1',
  },

  // ============================================
  // CAMADA 3: SWITCHES (y: 380)
  // ============================================
  // Salvador
  {
    nome: 'SW Pelourinho',
    tipo: TipoDispositivo.SWITCH,
    x: 80,
    y: 380,
    capacidadeProcessamento: 60,
    ip: '10.1.1.1',
  },
  {
    nome: 'SW Barra',
    tipo: TipoDispositivo.SWITCH,
    x: 180,
    y: 380,
    capacidadeProcessamento: 60,
    ip: '10.1.2.1',
  },
  {
    nome: 'SW Itapuã',
    tipo: TipoDispositivo.SWITCH,
    x: 280,
    y: 380,
    capacidadeProcessamento: 60,
    ip: '10.1.3.1',
  },

  // Feira de Santana
  {
    nome: 'SW Centro FSA',
    tipo: TipoDispositivo.SWITCH,
    x: 400,
    y: 380,
    capacidadeProcessamento: 55,
    ip: '10.2.1.1',
  },
  {
    nome: 'SW Tomba',
    tipo: TipoDispositivo.SWITCH,
    x: 500,
    y: 380,
    capacidadeProcessamento: 55,
    ip: '10.2.2.1',
  },

  // Vitória da Conquista
  {
    nome: 'SW Centro VDC',
    tipo: TipoDispositivo.SWITCH,
    x: 620,
    y: 380,
    capacidadeProcessamento: 50,
    ip: '10.3.1.1',
  },
  {
    nome: 'SW Candeias',
    tipo: TipoDispositivo.SWITCH,
    x: 720,
    y: 380,
    capacidadeProcessamento: 50,
    ip: '10.3.2.1',
  },

  // ============================================
  // CAMADA 4: HOSTS (y: 520)
  // ============================================
  // Pelourinho (3 hosts)
  {
    nome: 'PC Olodum',
    tipo: TipoDispositivo.HOST,
    x: 50,
    y: 520,
    capacidadeProcessamento: 40,
    ip: '10.1.1.10',
  },
  {
    nome: 'PC Malê',
    tipo: TipoDispositivo.HOST,
    x: 100,
    y: 520,
    capacidadeProcessamento: 40,
    ip: '10.1.1.11',
  },

  // Barra (1 host)
  {
    nome: 'PC Farol',
    tipo: TipoDispositivo.HOST,
    x: 180,
    y: 520,
    capacidadeProcessamento: 45,
    ip: '10.1.2.10',
  },

  // Itapuã (2 hosts)
  {
    nome: 'PC Abaeté',
    tipo: TipoDispositivo.HOST,
    x: 260,
    y: 520,
    capacidadeProcessamento: 35,
    ip: '10.1.3.10',
  },
  {
    nome: 'PC Praia',
    tipo: TipoDispositivo.HOST,
    x: 310,
    y: 520,
    capacidadeProcessamento: 35,
    ip: '10.1.3.11',
  },

  // Feira - Centro (2 hosts)
  {
    nome: 'PC UEFS',
    tipo: TipoDispositivo.HOST,
    x: 380,
    y: 520,
    capacidadeProcessamento: 50,
    ip: '10.2.1.10',
  },
  {
    nome: 'PC Feira',
    tipo: TipoDispositivo.HOST,
    x: 430,
    y: 520,
    capacidadeProcessamento: 30,
    ip: '10.2.1.11',
  },

  // Feira - Tomba (2 hosts)
  {
    nome: 'PC Micareta',
    tipo: TipoDispositivo.HOST,
    x: 480,
    y: 520,
    capacidadeProcessamento: 30,
    ip: '10.2.2.10',
  },
  {
    nome: 'PC Expo',
    tipo: TipoDispositivo.HOST,
    x: 530,
    y: 520,
    capacidadeProcessamento: 35,
    ip: '10.2.2.11',
  },

  // VDC - Centro (2 hosts)
  {
    nome: 'PC UESB',
    tipo: TipoDispositivo.HOST,
    x: 600,
    y: 520,
    capacidadeProcessamento: 50,
    ip: '10.3.1.10',
  },
  {
    nome: 'PC Serra',
    tipo: TipoDispositivo.HOST,
    x: 650,
    y: 520,
    capacidadeProcessamento: 30,
    ip: '10.3.1.11',
  },

  // VDC - Candeias (2 hosts)
  {
    nome: 'PC Poço',
    tipo: TipoDispositivo.HOST,
    x: 700,
    y: 520,
    capacidadeProcessamento: 25,
    ip: '10.3.2.10',
  },
  {
    nome: 'PC Jurema',
    tipo: TipoDispositivo.HOST,
    x: 750,
    y: 520,
    capacidadeProcessamento: 25,
    ip: '10.3.2.11',
  },

  // ============================================
  // EXTRAS: BACKUP E HUB LEGADO (canto direito)
  // ============================================
  {
    nome: 'Backup Ilhéus',
    tipo: TipoDispositivo.SERVIDOR,
    x: 850,
    y: 140,
    capacidadeProcessamento: 70,
    ip: '10.4.0.1',
  },
  {
    nome: 'Hub P. Seguro',
    tipo: TipoDispositivo.HUB,
    x: 850,
    y: 380,
    capacidadeProcessamento: 30,
    ip: '10.5.0.1',
  },
  {
    nome: 'PC Axé Moi',
    tipo: TipoDispositivo.HOST,
    x: 830,
    y: 520,
    capacidadeProcessamento: 20,
    ip: '10.5.0.10',
  },
  {
    nome: 'PC Arraial',
    tipo: TipoDispositivo.HOST,
    x: 880,
    y: 520,
    capacidadeProcessamento: 20,
    ip: '10.5.0.11',
  },
];

/**
 * Conexões da Rede Baiana
 */
export interface ConexaoSeedDef {
  origemIndex: number;
  destinoIndex: number;
  tipo: TipoConexao;
  latencia: number;
  banda: number;
}

export const conexoesSeedDef: ConexaoSeedDef[] = [
  // BACKBONE: DC → Firewall → Roteadores
  { origemIndex: 0, destinoIndex: 1, tipo: TipoConexao.FIBRA, latencia: 1, banda: 10000 },
  { origemIndex: 1, destinoIndex: 2, tipo: TipoConexao.FIBRA, latencia: 2, banda: 5000 },
  { origemIndex: 1, destinoIndex: 3, tipo: TipoConexao.FIBRA, latencia: 3, banda: 5000 },
  { origemIndex: 1, destinoIndex: 4, tipo: TipoConexao.FIBRA, latencia: 5, banda: 3000 },

  // Redundância entre Roteadores
  { origemIndex: 2, destinoIndex: 3, tipo: TipoConexao.FIBRA, latencia: 10, banda: 1000 },
  { origemIndex: 3, destinoIndex: 4, tipo: TipoConexao.FIBRA, latencia: 15, banda: 1000 },

  // Roteadores → Switches
  // Salvador
  { origemIndex: 2, destinoIndex: 5, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 1000 },
  { origemIndex: 2, destinoIndex: 6, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 1000 },
  { origemIndex: 2, destinoIndex: 7, tipo: TipoConexao.ETHERNET, latencia: 3, banda: 1000 },
  // Feira
  { origemIndex: 3, destinoIndex: 8, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 500 },
  { origemIndex: 3, destinoIndex: 9, tipo: TipoConexao.ETHERNET, latencia: 3, banda: 500 },
  // VDC
  { origemIndex: 4, destinoIndex: 10, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 500 },
  { origemIndex: 4, destinoIndex: 11, tipo: TipoConexao.ETHERNET, latencia: 4, banda: 300 },

  // Switches → Hosts
  // Pelourinho
  { origemIndex: 5, destinoIndex: 12, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  { origemIndex: 5, destinoIndex: 13, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  // Barra
  { origemIndex: 6, destinoIndex: 14, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  // Itapuã
  { origemIndex: 7, destinoIndex: 15, tipo: TipoConexao.WIRELESS, latencia: 5, banda: 50 },
  { origemIndex: 7, destinoIndex: 16, tipo: TipoConexao.WIRELESS, latencia: 5, banda: 50 },
  // Feira Centro
  { origemIndex: 8, destinoIndex: 17, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  { origemIndex: 8, destinoIndex: 18, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 50 },
  // Feira Tomba
  { origemIndex: 9, destinoIndex: 19, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  { origemIndex: 9, destinoIndex: 20, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  // VDC Centro
  { origemIndex: 10, destinoIndex: 21, tipo: TipoConexao.ETHERNET, latencia: 1, banda: 100 },
  { origemIndex: 10, destinoIndex: 22, tipo: TipoConexao.WIRELESS, latencia: 8, banda: 30 },
  // VDC Candeias
  { origemIndex: 11, destinoIndex: 23, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 50 },
  { origemIndex: 11, destinoIndex: 24, tipo: TipoConexao.ETHERNET, latencia: 2, banda: 50 },

  // Extras: Backup e Hub
  { origemIndex: 1, destinoIndex: 25, tipo: TipoConexao.VPN, latencia: 20, banda: 500 },
  { origemIndex: 4, destinoIndex: 26, tipo: TipoConexao.ETHERNET, latencia: 30, banda: 100 },
  { origemIndex: 26, destinoIndex: 27, tipo: TipoConexao.ETHERNET, latencia: 5, banda: 10 },
  { origemIndex: 26, destinoIndex: 28, tipo: TipoConexao.ETHERNET, latencia: 5, banda: 10 },
  // Redundância Backup
  { origemIndex: 4, destinoIndex: 25, tipo: TipoConexao.VPN, latencia: 25, banda: 200 },
];

/**
 * Logs iniciais
 */
export const logsIniciais = [
  { tipo: 'SUCCESS' as const, mensagem: 'Rede Baiana inicializada!' },
  { tipo: 'INFO' as const, mensagem: '29 dispositivos online' },
  { tipo: 'INFO' as const, mensagem: '31 conexões ativas' },
  { tipo: 'SUCCESS' as const, mensagem: 'Firewall ativo' },
];
