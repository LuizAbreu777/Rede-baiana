'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Dispositivo, 
  Conexao, 
  MetricasRede, 
  LogEvento, 
  Pacote, 
  Ataque,
  ResultadoCaminho,
  TipoDispositivo,
  TipoConexao,
  TipoAtaque,
  StatusDispositivo,
  StatusConexao
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface UseRedeReturn {
  dispositivos: Dispositivo[];
  conexoes: Conexao[];
  metricas: MetricasRede | null;
  logs: LogEvento[];
  pacotes: Pacote[];
  ataques: Ataque[];
  conectado: boolean;
  carregando: boolean;
  
  // Ações
  criarDispositivo: (dados: { nome: string; tipo: TipoDispositivo; x: number; y: number }) => Promise<void>;
  removerDispositivo: (id: string) => Promise<void>;
  criarConexao: (dados: { origem: string; destino: string; tipo: TipoConexao }) => Promise<void>;
  removerConexao: (id: string) => Promise<void>;
  enviarPacote: (origem: string, destino: string, algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS') => Promise<void>;
  buscarCaminho: (origem: string, destino: string, algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS') => Promise<ResultadoCaminho | null>;
  simularFalha: (tipo: 'dispositivo' | 'conexao', id: string) => Promise<void>;
  recuperar: (tipo: 'dispositivo' | 'conexao', id: string) => Promise<void>;
  iniciarAtaque: (tipo: TipoAtaque, alvos: string[], intensidade?: number) => Promise<void>;
  pararAtaque: (id: string) => Promise<void>;
  resetarRede: () => Promise<void>;
  atualizarPosicaoDispositivo: (id: string, x: number, y: number) => Promise<void>;
}

export function useRede(): UseRedeReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [metricas, setMetricas] = useState<MetricasRede | null>(null);
  const [logs, setLogs] = useState<LogEvento[]>([]);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [ataques, setAtaques] = useState<Ataque[]>([]);
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Conecta ao WebSocket
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Conectado ao servidor');
      setConectado(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado do servidor');
      setConectado(false);
    });

    newSocket.on('estado-inicial', (data) => {
      console.log('📦 Estado inicial recebido');
      setDispositivos(data.grafo.nodes);
      setConexoes(data.grafo.edges);
      setMetricas(data.metricas);
      setLogs(data.logs);
      setCarregando(false);
    });

    newSocket.on('atualizacao', (data) => {
      setDispositivos(data.grafo.nodes);
      setConexoes(data.grafo.edges);
      setMetricas(data.metricas);
      setPacotes(data.pacotes || []);
      setAtaques(data.ataques || []);
      if (data.logs) setLogs(data.logs);
    });

    newSocket.on('pacote-enviado', (pacote) => {
      console.log('📨 Pacote enviado:', pacote);
    });

    newSocket.on('rede-resetada', () => {
      console.log('🔄 Rede resetada');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Funções de API
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}/api/rede${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return response.json();
  };

  const criarDispositivo = useCallback(async (dados: { nome: string; tipo: TipoDispositivo; x: number; y: number }) => {
    if (socket) {
      socket.emit('criar-dispositivo', dados);
    }
  }, [socket]);

  const removerDispositivo = useCallback(async (id: string) => {
    if (socket) {
      socket.emit('remover-dispositivo', { id });
    }
  }, [socket]);

  const criarConexao = useCallback(async (dados: { origem: string; destino: string; tipo: TipoConexao }) => {
    if (socket) {
      socket.emit('criar-conexao', { ...dados, bidirecional: true });
    }
  }, [socket]);

  const removerConexao = useCallback(async (id: string) => {
    if (socket) {
      socket.emit('remover-conexao', { id });
    }
  }, [socket]);

  const enviarPacote = useCallback(async (origem: string, destino: string, algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' = 'DIJKSTRA') => {
    if (socket) {
      socket.emit('enviar-pacote', { origem, destino, algoritmo });
    }
  }, [socket]);

  const buscarCaminho = useCallback(async (origem: string, destino: string, algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' = 'DIJKSTRA'): Promise<ResultadoCaminho | null> => {
    const resultado = await fetchAPI(`/caminho?origem=${origem}&destino=${destino}&algoritmo=${algoritmo}`);
    return resultado;
  }, []);

  const simularFalha = useCallback(async (tipo: 'dispositivo' | 'conexao', id: string) => {
    if (socket) {
      socket.emit('simular-falha', { tipo, id });
    }
  }, [socket]);

  const recuperar = useCallback(async (tipo: 'dispositivo' | 'conexao', id: string) => {
    if (socket) {
      socket.emit('recuperar', { tipo, id });
    }
  }, [socket]);

  const iniciarAtaque = useCallback(async (tipo: TipoAtaque, alvos: string[], intensidade: number = 50) => {
    if (socket) {
      socket.emit('iniciar-ataque', { tipo, alvos, intensidade });
    }
  }, [socket]);

  const pararAtaque = useCallback(async (id: string) => {
    if (socket) {
      socket.emit('parar-ataque', { id });
    }
  }, [socket]);

  const resetarRede = useCallback(async () => {
    if (socket) {
      socket.emit('resetar-rede');
    }
  }, [socket]);

  const atualizarPosicaoDispositivo = useCallback(async (id: string, x: number, y: number) => {
    await fetchAPI(`/dispositivos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ x, y }),
    });
  }, []);

  return {
    dispositivos,
    conexoes,
    metricas,
    logs,
    pacotes,
    ataques,
    conectado,
    carregando,
    criarDispositivo,
    removerDispositivo,
    criarConexao,
    removerConexao,
    enviarPacote,
    buscarCaminho,
    simularFalha,
    recuperar,
    iniciarAtaque,
    pararAtaque,
    resetarRede,
    atualizarPosicaoDispositivo,
  };
}

