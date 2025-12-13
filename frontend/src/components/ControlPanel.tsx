'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Dispositivo, 
  TipoAtaque,
  ResultadoCaminho,
  Ataque,
  StatusDispositivo
} from '@/types';
import { 
  HiPaperAirplane, 
  HiMap, 
  HiLightningBolt, 
  HiShieldExclamation,
  HiSearch,
  HiCheck,
  HiX,
  HiArrowRight
} from 'react-icons/hi';
import { FaGamepad, FaRoute } from 'react-icons/fa';
import { BiTargetLock, BiShield } from 'react-icons/bi';
import { MdOutlineHealthAndSafety, MdOutlineCancel } from 'react-icons/md';
import { GiCrossedSwords } from 'react-icons/gi';

interface ControlPanelProps {
  dispositivos: Dispositivo[];
  dispositivoSelecionado: Dispositivo | null;
  ataques: Ataque[];
  onEnviarPacote: (origem: string, destino: string, algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS') => void;
  onBuscarCaminho: (origem: string, destino: string, algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS') => Promise<ResultadoCaminho | null>;
  onCaminhoEncontrado: (caminho: string[]) => void;
  onSimularFalha: (tipo: 'dispositivo' | 'conexao', id: string) => void;
  onRecuperar: (tipo: 'dispositivo' | 'conexao', id: string) => void;
  onIniciarAtaque: (tipo: TipoAtaque, alvos: string[], intensidade: number) => void;
  onPararAtaque: (id: string) => void;
}

type TabType = 'trafego' | 'falhas' | 'ataques' | 'caminho';

interface Tab {
  id: TabType;
  label: string;
  icon: ReactNode;
}

export function ControlPanel({
  dispositivos,
  dispositivoSelecionado,
  ataques,
  onEnviarPacote,
  onBuscarCaminho,
  onCaminhoEncontrado,
  onSimularFalha,
  onRecuperar,
  onIniciarAtaque,
  onPararAtaque,
}: ControlPanelProps) {
  const [tabAtiva, setTabAtiva] = useState<TabType>('trafego');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [algoritmo, setAlgoritmo] = useState<'DIJKSTRA' | 'BFS' | 'DFS'>('DIJKSTRA');
  const [resultadoCaminho, setResultadoCaminho] = useState<ResultadoCaminho | null>(null);
  const [tipoAtaque, setTipoAtaque] = useState<TipoAtaque>(TipoAtaque.DOS);
  const [intensidadeAtaque, setIntensidadeAtaque] = useState(50);

  const tabs: Tab[] = [
    { id: 'trafego', label: 'Tráfego', icon: <HiPaperAirplane className="w-4 h-4" /> },
    { id: 'caminho', label: 'Caminho', icon: <FaRoute className="w-4 h-4" /> },
    { id: 'falhas', label: 'Falhas', icon: <HiLightningBolt className="w-4 h-4" /> },
    { id: 'ataques', label: 'Ataques', icon: <HiShieldExclamation className="w-4 h-4" /> },
  ];

  const handleEnviarPacote = () => {
    if (origem && destino) {
      onEnviarPacote(origem, destino, algoritmo);
    }
  };

  const handleBuscarCaminho = async () => {
    if (origem && destino) {
      const resultado = await onBuscarCaminho(origem, destino, algoritmo);
      setResultadoCaminho(resultado);
      if (resultado?.encontrado) {
        onCaminhoEncontrado(resultado.caminho);
      }
    }
  };

  const handleSimularFalha = () => {
    if (dispositivoSelecionado) {
      onSimularFalha('dispositivo', dispositivoSelecionado.id);
    }
  };

  const handleRecuperar = () => {
    if (dispositivoSelecionado) {
      onRecuperar('dispositivo', dispositivoSelecionado.id);
    }
  };

  const handleIniciarAtaque = () => {
    if (dispositivoSelecionado) {
      onIniciarAtaque(tipoAtaque, [dispositivoSelecionado.id], intensidadeAtaque);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <FaGamepad className="w-6 h-6 text-bahia-azul" />
        <h2 className="panel-title">Painel de Controle</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white/5 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabAtiva(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              tabAtiva === tab.id
                ? 'bg-gradient-to-r from-bahia-vermelho to-bahia-azul text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-4">
        {/* Tab Tráfego */}
        {tabAtiva === 'trafego' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Origem</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="select"
                >
                  <option value="">Selecione...</option>
                  {dispositivos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="select"
                >
                  <option value="">Selecione...</option>
                  {dispositivos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1 block">Algoritmo</label>
              <select
                value={algoritmo}
                onChange={(e) => setAlgoritmo(e.target.value as any)}
                className="select"
              >
                <option value="DIJKSTRA">Dijkstra (Menor Custo)</option>
                <option value="BFS">BFS (Menos Saltos)</option>
                <option value="DFS">DFS (Busca em Profundidade)</option>
              </select>
            </div>

            <button
              onClick={handleEnviarPacote}
              disabled={!origem || !destino}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              <HiPaperAirplane className="w-4 h-4" /> Enviar Pacote
            </button>
          </motion.div>
        )}

        {/* Tab Caminho */}
        {tabAtiva === 'caminho' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Origem</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="select"
                >
                  <option value="">Selecione...</option>
                  {dispositivos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="select"
                >
                  <option value="">Selecione...</option>
                  {dispositivos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1 block">Algoritmo de Busca</label>
              <select
                value={algoritmo}
                onChange={(e) => setAlgoritmo(e.target.value as any)}
                className="select"
              >
                <option value="DIJKSTRA">Dijkstra (Menor Custo)</option>
                <option value="BFS">BFS (Breadth-First Search)</option>
                <option value="DFS">DFS (Depth-First Search)</option>
              </select>
            </div>

            <button
              onClick={handleBuscarCaminho}
              disabled={!origem || !destino}
              className="btn btn-secondary w-full disabled:opacity-50"
            >
              <HiSearch className="w-4 h-4" /> Buscar Caminho
            </button>

            {/* Resultado do caminho */}
            {resultadoCaminho && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                {resultadoCaminho.encontrado ? (
                  <>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <HiCheck className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Caminho encontrado!</span>
                    </div>
                    <div className="text-sm space-y-1 text-white/80">
                      <p><strong>Algoritmo:</strong> {resultadoCaminho.algoritmoUsado}</p>
                      <p><strong>Saltos:</strong> {resultadoCaminho.saltos}</p>
                      <p><strong>Latência:</strong> {resultadoCaminho.latenciaEstimada}ms</p>
                      <p><strong>Custo:</strong> {resultadoCaminho.custoTotal.toFixed(2)}</p>
                      <div className="mt-2">
                        <strong>Rota:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {resultadoCaminho.caminho.map((id, i) => {
                            const disp = dispositivos.find(d => d.id === id);
                            return (
                              <span key={id} className="flex items-center">
                                <span className="px-2 py-1 bg-bahia-azul/30 rounded text-xs">
                                  {disp?.nome || id}
                                </span>
                                {i < resultadoCaminho.caminho.length - 1 && (
                                  <span className="mx-1 text-white/40">→</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <HiX className="w-5 h-5 text-red-400" />
                    <span>Caminho não encontrado</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab Falhas */}
        {tabAtiva === 'falhas' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {dispositivoSelecionado ? (
              <>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Dispositivo selecionado:</p>
                  <p className="font-medium">{dispositivoSelecionado.nome}</p>
                  <p className="text-xs text-white/40">
                    Status: {dispositivoSelecionado.status}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSimularFalha}
                    className="btn btn-danger"
                  >
                    <HiLightningBolt className="w-4 h-4" /> Derrubar
                  </button>
                  <button
                    onClick={handleRecuperar}
                    className="btn btn-success"
                  >
                    <MdOutlineHealthAndSafety className="w-4 h-4" /> Recuperar
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-white/40 py-8">
                Selecione um dispositivo no mapa para simular falhas
              </p>
            )}
          </motion.div>
        )}

        {/* Tab Ataques */}
        {tabAtiva === 'ataques' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Ataques Ativos */}
            {ataques.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <GiCrossedSwords className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    Ataques Ativos ({ataques.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {ataques.map((ataque) => (
                    <div key={ataque.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <div className="text-xs">
                        <span className="text-red-300 font-medium">{ataque.tipo}</span>
                        <span className="text-white/50 ml-2">
                          {ataque.alvos.length} alvo(s) | {ataque.intensidade}%
                        </span>
                      </div>
                      <button
                        onClick={() => onPararAtaque(ataque.id)}
                        className="btn btn-ghost text-xs py-1 px-2 text-green-400 hover:text-green-300"
                      >
                        <BiShield className="w-3 h-3" /> Neutralizar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dispositivo Comprometido - Opção de Recuperar */}
            {dispositivoSelecionado?.status === StatusDispositivo.COMPROMETIDO && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <HiShieldExclamation className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">
                    Dispositivo Comprometido
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-2">
                  {dispositivoSelecionado.nome} está sob ataque
                </p>
                <button
                  onClick={() => onRecuperar('dispositivo', dispositivoSelecionado.id)}
                  className="btn btn-success w-full text-sm"
                >
                  <MdOutlineHealthAndSafety className="w-4 h-4" /> Recuperar Dispositivo
                </button>
              </div>
            )}

            {/* Formulário para novo ataque */}
            {dispositivoSelecionado && dispositivoSelecionado.status !== StatusDispositivo.COMPROMETIDO ? (
              <>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Alvo do ataque:</p>
                  <p className="font-medium">{dispositivoSelecionado.nome}</p>
                  <p className="text-xs text-white/40">Status: {dispositivoSelecionado.status}</p>
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1 block">Tipo de Ataque</label>
                  <select
                    value={tipoAtaque}
                    onChange={(e) => setTipoAtaque(e.target.value as TipoAtaque)}
                    className="select"
                  >
                    <option value={TipoAtaque.DOS}>DoS (Denial of Service)</option>
                    <option value={TipoAtaque.DDOS}>DDoS (Distributed DoS)</option>
                    <option value={TipoAtaque.MALWARE}>Malware</option>
                    <option value={TipoAtaque.MAN_IN_MIDDLE}>Man in the Middle</option>
                    <option value={TipoAtaque.ROTEADOR_MALICIOSO}>Roteador Malicioso</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1 block">
                    Intensidade: {intensidadeAtaque}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={intensidadeAtaque}
                    onChange={(e) => setIntensidadeAtaque(Number(e.target.value))}
                    className="w-full accent-bahia-vermelho"
                  />
                </div>

                <button
                  onClick={handleIniciarAtaque}
                  className="btn btn-danger w-full"
                >
                  <BiTargetLock className="w-4 h-4" /> Iniciar Ataque
                </button>
              </>
            ) : !dispositivoSelecionado && (
              <p className="text-center text-white/40 py-4 text-sm">
                Selecione um dispositivo no mapa para simular ataques
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

