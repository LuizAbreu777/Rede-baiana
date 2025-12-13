'use client';

import { useState, useCallback } from 'react';

export interface Acao {
  tipo: 'mover-dispositivo' | 'mover-multiplos' | 'criar-dispositivo' | 'remover-dispositivo' | 'criar-conexao' | 'remover-conexao';
  dados: any;
  dadosAnteriores?: any;
  timestamp: number;
}

interface UseHistoricoReturn {
  historico: Acao[];
  indiceAtual: number;
  podeDesfazer: boolean;
  podeRefazer: boolean;
  adicionarAcao: (acao: Omit<Acao, 'timestamp'>) => void;
  desfazer: () => Acao | null;
  refazer: () => Acao | null;
  limparHistorico: () => void;
}

const MAX_HISTORICO = 50;

export function useHistorico(): UseHistoricoReturn {
  const [historico, setHistorico] = useState<Acao[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(-1);

  const podeDesfazer = indiceAtual >= 0;
  const podeRefazer = indiceAtual < historico.length - 1;

  const adicionarAcao = useCallback((acao: Omit<Acao, 'timestamp'>) => {
    const novaAcao: Acao = {
      ...acao,
      timestamp: Date.now(),
    };

    setHistorico(prev => {
      // Remove ações futuras se estamos no meio do histórico
      const novoHistorico = prev.slice(0, indiceAtual + 1);
      novoHistorico.push(novaAcao);
      
      // Limitar tamanho do histórico
      if (novoHistorico.length > MAX_HISTORICO) {
        novoHistorico.shift();
        return novoHistorico;
      }
      
      return novoHistorico;
    });
    
    setIndiceAtual(prev => Math.min(prev + 1, MAX_HISTORICO - 1));
  }, [indiceAtual]);

  const desfazer = useCallback((): Acao | null => {
    if (!podeDesfazer) return null;
    
    const acao = historico[indiceAtual];
    setIndiceAtual(prev => prev - 1);
    return acao;
  }, [historico, indiceAtual, podeDesfazer]);

  const refazer = useCallback((): Acao | null => {
    if (!podeRefazer) return null;
    
    const acao = historico[indiceAtual + 1];
    setIndiceAtual(prev => prev + 1);
    return acao;
  }, [historico, indiceAtual, podeRefazer]);

  const limparHistorico = useCallback(() => {
    setHistorico([]);
    setIndiceAtual(-1);
  }, []);

  return {
    historico,
    indiceAtual,
    podeDesfazer,
    podeRefazer,
    adicionarAcao,
    desfazer,
    refazer,
    limparHistorico,
  };
}

