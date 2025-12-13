'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRede } from '@/hooks/useRede';
import {
  Header,
  NetworkCanvas,
  MetricsPanel,
  ControlPanel,
  LogsPanel,
  DeviceInfo,
  Mascote,
} from '@/components';
import { Dispositivo } from '@/types';
import { FaBook, FaNetworkWired } from 'react-icons/fa';
import { GiPalmTree } from 'react-icons/gi';

export default function Home() {
  const {
    dispositivos,
    conexoes,
    metricas,
    logs,
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
  } = useRede();

  const [dispositivoSelecionado, setDispositivoSelecionado] = useState<Dispositivo | null>(null);
  const [caminhoDestacado, setCaminhoDestacado] = useState<string[]>([]);

  const handleCaminhoEncontrado = (caminho: string[]) => {
    setCaminhoDestacado(caminho);
    // Limpa o destaque após 5 segundos
    setTimeout(() => setCaminhoDestacado([]), 5000);
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="loading-spinner mb-4" />
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-2xl"
        >
          Carregando Rede Baiana...
        </motion.h2>
        <p className="text-white/60 mt-2">Conectando ao servidor</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <Header conectado={conectado} onResetar={resetarRede} />

      {/* Conteúdo Principal - Layout Side by Side */}
      <div className="flex-1 p-2 sm:p-4 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* LADO ESQUERDO - Canvas da Rede (65%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-[65%] overflow-x-auto"
          >
            <NetworkCanvas
              dispositivos={dispositivos}
              conexoes={conexoes}
              caminhoDestacado={caminhoDestacado}
              dispositivoSelecionado={dispositivoSelecionado}
              onSelectDispositivo={setDispositivoSelecionado}
              onMoveDispositivo={atualizarPosicaoDispositivo}
              onCriarDispositivo={criarDispositivo}
              onRemoverDispositivo={removerDispositivo}
              onCriarConexao={criarConexao}
              onRemoverConexao={removerConexao}
            />
          </motion.div>

          {/* LADO DIREITO - Cards Empilhados (35%) */}
          <div className="lg:w-[35%] space-y-4">
            
            {/* Card: Métricas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MetricsPanel metricas={metricas} />
            </motion.div>

            {/* Card: Dispositivo Selecionado */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DeviceInfo
                dispositivo={dispositivoSelecionado}
                onClose={() => setDispositivoSelecionado(null)}
              />
            </motion.div>

            {/* Card: Painel de Controle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ControlPanel
                dispositivos={dispositivos}
                dispositivoSelecionado={dispositivoSelecionado}
                ataques={ataques}
                onEnviarPacote={enviarPacote}
                onBuscarCaminho={buscarCaminho}
                onCaminhoEncontrado={handleCaminhoEncontrado}
                onSimularFalha={simularFalha}
                onRecuperar={recuperar}
                onIniciarAtaque={iniciarAtaque}
                onPararAtaque={pararAtaque}
              />
            </motion.div>

            {/* Card: Logs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LogsPanel logs={logs} />
            </motion.div>
          </div>
        </div>

        {/* Seção de Informações do Projeto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="panel">
            <div className="panel-header">
              <FaBook className="w-6 h-6 text-bahia-vermelho" />
              <h2 className="panel-title">Sobre o Projeto</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-sm">
              {/* Estrutura de Dados */}
              <div className="space-y-2">
                <h3 className="font-display text-lg text-bahia-vermelho">Estrutura de Dados</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• <strong>Grafo Ponderado Direcionado</strong></li>
                  <li>• Lista de Adjacência (Lista Encadeada)</li>
                  <li>• Heap Mínimo para Dijkstra</li>
                  <li>• Implementação própria sem bibliotecas</li>
                </ul>
              </div>

              {/* Algoritmos */}
              <div className="space-y-2">
                <h3 className="font-display text-lg text-bahia-azul">Algoritmos Implementados</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• <strong>Dijkstra</strong> - Menor caminho ponderado</li>
                  <li>• <strong>BFS</strong> - Menor número de saltos</li>
                  <li>• <strong>DFS</strong> - Busca em profundidade</li>
                  <li>• <strong>Componentes Conectados</strong></li>
                </ul>
              </div>

              {/* Funcionalidades */}
              <div className="space-y-2">
                <h3 className="font-display text-lg text-green-400">Funcionalidades</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• Simulação de tráfego de pacotes</li>
                  <li>• Simulação de falhas e recuperação</li>
                  <li>• Simulação de ataques (DoS, DDoS, etc.)</li>
                  <li>• Métricas em tempo real</li>
                </ul>
              </div>
            </div>

            {/* Complexidades */}
            <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-display text-lg mb-2">Complexidade dos Algoritmos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-white/40">Inserir Vértice</span>
                  <p className="font-mono text-green-400">O(1)</p>
                </div>
                <div>
                  <span className="text-white/40">Inserir Aresta</span>
                  <p className="font-mono text-green-400">O(1)</p>
                </div>
                <div>
                  <span className="text-white/40">Dijkstra</span>
                  <p className="font-mono text-yellow-400">O((V+E) log V)</p>
                </div>
                <div>
                  <span className="text-white/40">BFS/DFS</span>
                  <p className="font-mono text-green-400">O(V + E)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mascote */}
      <Mascote />

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-white/40 text-sm border-t border-white/10">
        <p>
          <GiPalmTree className="w-5 h-5 text-green-500 inline mr-1" />
          <span className="font-display">REDE BAIANA</span> - Simulador de Infraestrutura de Rede
        </p>
        <p className="text-xs mt-1">
          Desenvolvido para a disciplina de Algoritmos e Estruturas de Dados
        </p>
      </footer>
    </main>
  );
}

