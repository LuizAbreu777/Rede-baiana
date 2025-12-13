'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispositivo, Conexao, StatusDispositivo, StatusConexao, TipoDispositivo, TipoConexao } from '@/types';
import { 
  HiServer,
} from 'react-icons/hi';
import { 
  FaNetworkWired, 
  FaServer,
  FaExchangeAlt,
  FaBolt,
  FaDesktop,
} from 'react-icons/fa';
import { MdShield } from 'react-icons/md';
import { BiError } from 'react-icons/bi';
import { IoWarning } from 'react-icons/io5';
import { CanvasToolbar, ToolType } from './CanvasToolbar';
import { useHistorico } from '@/hooks/useHistorico';

interface NetworkCanvasProps {
  dispositivos: Dispositivo[];
  conexoes: Conexao[];
  caminhoDestacado?: string[];
  dispositivoSelecionado: Dispositivo | null;
  onSelectDispositivo: (dispositivo: Dispositivo | null) => void;
  onMoveDispositivo?: (id: string, x: number, y: number) => void;
  onCriarDispositivo?: (dados: { nome: string; tipo: TipoDispositivo; x: number; y: number }) => void;
  onRemoverDispositivo?: (id: string) => void;
  onCriarConexao?: (dados: { origem: string; destino: string; tipo: TipoConexao }) => void;
  onRemoverConexao?: (id: string) => void;
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const IconeDispositivo = ({ tipo, className = "w-6 h-6 text-white" }: { tipo: TipoDispositivo; className?: string }) => {
  switch (tipo) {
    case TipoDispositivo.HOST:
      return <FaDesktop className={className} />;
    case TipoDispositivo.ROTEADOR:
      return <FaNetworkWired className={className} />;
    case TipoDispositivo.SWITCH:
      return <FaExchangeAlt className={className} />;
    case TipoDispositivo.HUB:
      return <FaBolt className={className} />;
    case TipoDispositivo.FIREWALL:
      return <MdShield className={className} />;
    case TipoDispositivo.SERVIDOR:
      return <FaServer className={className} />;
    default:
      return <HiServer className={className} />;
  }
};

const corStatus: Record<StatusDispositivo, string> = {
  ONLINE: 'device-online',
  OFFLINE: 'device-offline',
  CONGESTIONADO: 'device-congestionado',
  MANUTENCAO: 'device-offline',
  COMPROMETIDO: 'device-comprometido',
};

const nomeDispositivo: Record<TipoDispositivo, string> = {
  HOST: 'Host',
  ROTEADOR: 'Roteador',
  SWITCH: 'Switch',
  HUB: 'Hub',
  FIREWALL: 'Firewall',
  SERVIDOR: 'Servidor',
};

export function NetworkCanvas({
  dispositivos,
  conexoes,
  caminhoDestacado = [],
  dispositivoSelecionado,
  onSelectDispositivo,
  onMoveDispositivo,
  onCriarDispositivo,
  onRemoverDispositivo,
  onCriarConexao,
  onRemoverConexao,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Hook de histórico para desfazer/refazer
  const { podeDesfazer, podeRefazer, adicionarAcao, desfazer, refazer } = useHistorico();
  
  // Estado de arrastar dispositivo único
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [posicaoAnterior, setPosicaoAnterior] = useState<{x: number, y: number} | null>(null);
  const [posicoesAnterioresMultiplos, setPosicoesAnterioresMultiplos] = useState<Map<string, {x: number, y: number}>>(new Map());
  
  // Estado de seleção múltipla
  const [dispositivosSelecionados, setDispositivosSelecionados] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [arrastandoMultiplos, setArrastandoMultiplos] = useState(false);
  const [posicaoInicialMultiplos, setPosicaoInicialMultiplos] = useState<Map<string, {x: number, y: number}>>(new Map());
  
  // Estado das ferramentas
  const [ferramentaAtiva, setFerramentaAtiva] = useState<ToolType>('select');
  const [dispositivoParaAdicionar, setDispositivoParaAdicionar] = useState<TipoDispositivo | null>(null);
  const [conexaoOrigem, setConexaoOrigem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contadorDispositivos, setContadorDispositivos] = useState(1);

  // Processar ação de desfazer
  const processarDesfazer = useCallback(() => {
    const acao = desfazer();
    if (!acao) return;
    
    if (acao.tipo === 'mover-dispositivo' && onMoveDispositivo && acao.dadosAnteriores) {
      onMoveDispositivo(acao.dados.id, acao.dadosAnteriores.x, acao.dadosAnteriores.y);
    } else if (acao.tipo === 'mover-multiplos' && onMoveDispositivo && acao.dadosAnteriores) {
      Object.entries(acao.dadosAnteriores).forEach(([id, pos]: [string, any]) => {
        onMoveDispositivo(id, pos.x, pos.y);
      });
    }
  }, [desfazer, onMoveDispositivo]);

  // Processar ação de refazer
  const processarRefazer = useCallback(() => {
    const acao = refazer();
    if (!acao) return;
    
    if (acao.tipo === 'mover-dispositivo' && onMoveDispositivo) {
      onMoveDispositivo(acao.dados.id, acao.dados.x, acao.dados.y);
    } else if (acao.tipo === 'mover-multiplos' && onMoveDispositivo) {
      Object.entries(acao.dados).forEach(([id, pos]: [string, any]) => {
        onMoveDispositivo(id, pos.x, pos.y);
      });
    }
  }, [refazer, onMoveDispositivo]);

  // Atalhos de teclado (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        processarDesfazer();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        processarRefazer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processarDesfazer, processarRefazer]);

  // Função para verificar se uma conexão está no caminho destacado
  const conexaoDestacada = (conexao: Conexao): boolean => {
    if (caminhoDestacado.length < 2) return false;
    for (let i = 0; i < caminhoDestacado.length - 1; i++) {
      if (
        (conexao.origem === caminhoDestacado[i] && conexao.destino === caminhoDestacado[i + 1]) ||
        (conexao.destino === caminhoDestacado[i] && conexao.origem === caminhoDestacado[i + 1])
      ) {
        return true;
      }
    }
    return false;
  };

  // Verifica se um dispositivo está dentro da caixa de seleção
  const isInsideSelectionBox = useCallback((dispositivo: Dispositivo, box: SelectionBox): boolean => {
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);
    
    return dispositivo.x >= minX && dispositivo.x <= maxX && 
           dispositivo.y >= minY && dispositivo.y <= maxY;
  }, []);

  // Handler para começar a arrastar dispositivo individual
  const handleDeviceMouseDown = (e: React.MouseEvent, dispositivo: Dispositivo) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (ferramentaAtiva === 'select') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Se o dispositivo já está na seleção múltipla, mover todos
      if (dispositivosSelecionados.has(dispositivo.id) && dispositivosSelecionados.size > 1) {
        setArrastandoMultiplos(true);
        setOffset({ x: mouseX, y: mouseY });
        
        // Salvar posições iniciais de todos os dispositivos selecionados
        const posicoes = new Map<string, {x: number, y: number}>();
        const posicoesAnteriores = new Map<string, {x: number, y: number}>();
        dispositivosSelecionados.forEach(id => {
          const d = dispositivos.find(dev => dev.id === id);
          if (d) {
            posicoes.set(id, { x: d.x, y: d.y });
            posicoesAnteriores.set(id, { x: d.x, y: d.y });
          }
        });
        setPosicaoInicialMultiplos(posicoes);
        setPosicoesAnterioresMultiplos(posicoesAnteriores);
      } else {
        // Arrastar dispositivo único
        setArrastando(dispositivo.id);
        setPosicaoAnterior({ x: dispositivo.x, y: dispositivo.y });
        setOffset({
          x: mouseX - dispositivo.x,
          y: mouseY - dispositivo.y,
        });
        
        // Se não está segurando Ctrl/Cmd, limpar seleção e selecionar apenas este
        if (!e.ctrlKey && !e.metaKey) {
          setDispositivosSelecionados(new Set([dispositivo.id]));
        }
      }
    }
  };

  // Handler para mouse down no canvas (iniciar seleção em área)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ferramentaAtiva === 'select') {
      // Iniciar caixa de seleção
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      
      // Limpar seleção anterior se não segurando Ctrl/Cmd
      if (!e.ctrlKey && !e.metaKey) {
        setDispositivosSelecionados(new Set());
        onSelectDispositivo(null);
      }
    } else if (ferramentaAtiva === 'add-device' && dispositivoParaAdicionar && onCriarDispositivo) {
      const nome = `${nomeDispositivo[dispositivoParaAdicionar]} ${contadorDispositivos}`;
      onCriarDispositivo({ nome, tipo: dispositivoParaAdicionar, x, y });
      setContadorDispositivos(prev => prev + 1);
    }
  };

  // Handler para movimento do mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Atualizar caixa de seleção
    if (selectionBox && ferramentaAtiva === 'select') {
      setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
      
      // Atualizar dispositivos selecionados em tempo real
      const novaSeleção = new Set<string>();
      dispositivos.forEach(d => {
        if (isInsideSelectionBox(d, { ...selectionBox, endX: x, endY: y })) {
          novaSeleção.add(d.id);
        }
      });
      setDispositivosSelecionados(novaSeleção);
    }

    // Arrastar múltiplos dispositivos
    if (arrastandoMultiplos && ferramentaAtiva === 'select') {
      const deltaX = x - offset.x;
      const deltaY = y - offset.y;

      dispositivosSelecionados.forEach(id => {
        const dispositivo = dispositivos.find(d => d.id === id);
        const posicaoInicial = posicaoInicialMultiplos.get(id);
        if (dispositivo && posicaoInicial) {
          dispositivo.x = Math.max(30, Math.min(rect.width - 30, posicaoInicial.x + deltaX));
          dispositivo.y = Math.max(30, Math.min(rect.height - 30, posicaoInicial.y + deltaY));
        }
      });
    }

    // Arrastar dispositivo único
    if (arrastando && ferramentaAtiva === 'select' && !arrastandoMultiplos) {
      const newX = Math.max(30, Math.min(rect.width - 30, x - offset.x));
      const newY = Math.max(30, Math.min(rect.height - 30, y - offset.y));

      const dispositivo = dispositivos.find(d => d.id === arrastando);
      if (dispositivo) {
        dispositivo.x = newX;
        dispositivo.y = newY;
      }
    }
  };

  // Handler para soltar o mouse
  const handleMouseUp = () => {
    // Finalizar seleção em área
    if (selectionBox) {
      setSelectionBox(null);
    }

    // Salvar posição de múltiplos dispositivos
    if (arrastandoMultiplos && onMoveDispositivo) {
      const dadosNovos: Record<string, {x: number, y: number}> = {};
      const dadosAnteriores: Record<string, {x: number, y: number}> = {};
      let houveMovimento = false;

      dispositivosSelecionados.forEach(id => {
        const dispositivo = dispositivos.find(d => d.id === id);
        const posAnterior = posicoesAnterioresMultiplos.get(id);
        if (dispositivo) {
          onMoveDispositivo(id, dispositivo.x, dispositivo.y);
          dadosNovos[id] = { x: dispositivo.x, y: dispositivo.y };
          if (posAnterior) {
            dadosAnteriores[id] = posAnterior;
            if (posAnterior.x !== dispositivo.x || posAnterior.y !== dispositivo.y) {
              houveMovimento = true;
            }
          }
        }
      });

      // Registrar no histórico se houve movimento
      if (houveMovimento) {
        adicionarAcao({
          tipo: 'mover-multiplos',
          dados: dadosNovos,
          dadosAnteriores: dadosAnteriores,
        });
      }

      setArrastandoMultiplos(false);
      setPosicaoInicialMultiplos(new Map());
      setPosicoesAnterioresMultiplos(new Map());
    }

    // Salvar posição de dispositivo único
    if (arrastando && onMoveDispositivo) {
      const dispositivo = dispositivos.find(d => d.id === arrastando);
      if (dispositivo) {
        // Registrar no histórico se a posição mudou
        if (posicaoAnterior && (posicaoAnterior.x !== dispositivo.x || posicaoAnterior.y !== dispositivo.y)) {
          adicionarAcao({
            tipo: 'mover-dispositivo',
            dados: { id: arrastando, x: dispositivo.x, y: dispositivo.y },
            dadosAnteriores: posicaoAnterior,
          });
        }
        onMoveDispositivo(arrastando, dispositivo.x, dispositivo.y);
      }
    }
    
    setArrastando(null);
    setOffset({ x: 0, y: 0 });
    setPosicaoAnterior(null);
  };

  // Handler para clicar em um dispositivo
  const handleDeviceClick = (e: React.MouseEvent, dispositivo: Dispositivo) => {
    e.stopPropagation();
    
    if (ferramentaAtiva === 'select') {
      if (e.ctrlKey || e.metaKey) {
        // Toggle seleção com Ctrl/Cmd
        const novaSeleção = new Set(dispositivosSelecionados);
        if (novaSeleção.has(dispositivo.id)) {
          novaSeleção.delete(dispositivo.id);
        } else {
          novaSeleção.add(dispositivo.id);
        }
        setDispositivosSelecionados(novaSeleção);
      } else {
        // Selecionar apenas este
        setDispositivosSelecionados(new Set([dispositivo.id]));
        onSelectDispositivo(dispositivo);
      }
    } else if (ferramentaAtiva === 'add-connection') {
      if (!conexaoOrigem) {
        setConexaoOrigem(dispositivo.id);
      } else if (conexaoOrigem !== dispositivo.id && onCriarConexao) {
        onCriarConexao({
          origem: conexaoOrigem,
          destino: dispositivo.id,
          tipo: TipoConexao.ETHERNET,
        });
        setConexaoOrigem(null);
      }
    } else if (ferramentaAtiva === 'delete' && onRemoverDispositivo) {
      // Deletar todos os selecionados se houver múltiplos
      if (dispositivosSelecionados.size > 1 && dispositivosSelecionados.has(dispositivo.id)) {
        if (confirm(`Deseja remover ${dispositivosSelecionados.size} dispositivos?`)) {
          dispositivosSelecionados.forEach(id => onRemoverDispositivo(id));
          setDispositivosSelecionados(new Set());
        }
      } else {
        if (confirm(`Deseja remover o dispositivo "${dispositivo.nome}"?`)) {
          onRemoverDispositivo(dispositivo.id);
        }
      }
    }
  };

  // Handler para clicar em uma conexão
  const handleConnectionClick = (conexao: Conexao, e: React.MouseEvent) => {
    e.stopPropagation();
    if (ferramentaAtiva === 'delete' && onRemoverConexao) {
      if (confirm('Deseja remover esta conexão?')) {
        onRemoverConexao(conexao.id);
      }
    }
  };

  // Limpar seleção ao clicar no canvas vazio
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && ferramentaAtiva === 'select') {
      if (!selectionBox) {
        setDispositivosSelecionados(new Set());
        onSelectDispositivo(null);
      }
    }
  };

  // Cursor baseado na ferramenta
  const getCursorClass = () => {
    if (selectionBox) return 'cursor-crosshair';
    switch (ferramentaAtiva) {
      case 'add-device': return 'cursor-crosshair';
      case 'add-connection': return 'cursor-cell';
      case 'delete': return 'cursor-pointer';
      default: return 'cursor-default';
    }
  };

  // Calcular dimensões da caixa de seleção
  const getSelectionBoxStyle = () => {
    if (!selectionBox) return {};
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);
    return { left, top, width, height };
  };

  const origemDispositivo = conexaoOrigem ? dispositivos.find(d => d.id === conexaoOrigem) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <CanvasToolbar
        ferramentaAtiva={ferramentaAtiva}
        dispositivoParaAdicionar={dispositivoParaAdicionar}
        podeDesfazer={podeDesfazer}
        podeRefazer={podeRefazer}
        onSelectTool={(tool) => {
          setFerramentaAtiva(tool);
          setConexaoOrigem(null);
          if (tool !== 'select') {
            setDispositivosSelecionados(new Set());
          }
        }}
        onSelectDeviceType={setDispositivoParaAdicionar}
        onDesfazer={processarDesfazer}
        onRefazer={processarRefazer}
      />

      {/* Indicador de seleção múltipla */}
      {dispositivosSelecionados.size > 1 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bahia-azul/20 border border-bahia-azul/40 rounded-lg text-xs text-white/80">
          <span className="font-medium">{dispositivosSelecionados.size} dispositivos selecionados</span>
          <span className="text-white/50">• Arraste para mover todos • Ctrl+Clique para adicionar/remover</span>
          <button 
            onClick={() => setDispositivosSelecionados(new Set())}
            className="ml-auto text-white/40 hover:text-white"
          >
            Limpar
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`network-canvas w-full h-[650px] lg:h-[calc(100vh-200px)] min-h-[450px] relative ${getCursorClass()}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Caixa de seleção */}
        {selectionBox && (
          <div
            className="absolute border-2 border-bahia-azul bg-bahia-azul/10 pointer-events-none z-50"
            style={getSelectionBoxStyle()}
          />
        )}

        {/* SVG para conexões */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00529F" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D52B1E" stopOpacity="0.6" />
            </linearGradient>
            
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="previewGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Preview de conexão sendo criada */}
          {origemDispositivo && ferramentaAtiva === 'add-connection' && (
            <line
              x1={origemDispositivo.x}
              y1={origemDispositivo.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="url(#previewGradient)"
              strokeWidth={3}
              strokeDasharray="8,4"
              opacity={0.7}
            />
          )}

          {/* Renderiza conexões */}
          {conexoes.map((conexao) => {
            const origem = dispositivos.find(d => d.id === conexao.origem);
            const destino = dispositivos.find(d => d.id === conexao.destino);
            
            if (!origem || !destino) return null;

            const isHighlighted = conexaoDestacada(conexao);
            const isActive = conexao.status === StatusConexao.ATIVA;
            const canDelete = ferramentaAtiva === 'delete';
            
            return (
              <g 
                key={conexao.id}
                style={{ pointerEvents: canDelete ? 'auto' : 'none' }}
                onClick={(e) => handleConnectionClick(conexao, e)}
                className={canDelete ? 'cursor-pointer' : ''}
              >
                {canDelete && (
                  <line
                    x1={origem.x}
                    y1={origem.y}
                    x2={destino.x}
                    y2={destino.y}
                    stroke="transparent"
                    strokeWidth={15}
                  />
                )}
                
                <line
                  x1={origem.x}
                  y1={origem.y}
                  x2={destino.x}
                  y2={destino.y}
                  stroke={isHighlighted ? 'url(#highlightGradient)' : isActive ? 'url(#connectionGradient)' : '#4B5563'}
                  strokeWidth={isHighlighted ? 4 : 2}
                  strokeDasharray={!isActive ? '5,5' : undefined}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                  className={`transition-all duration-300 ${canDelete ? 'hover:stroke-red-500' : ''}`}
                />
                
                {isActive && isHighlighted && (
                  <circle r="4" fill="#10B981">
                    <animateMotion
                      dur="1s"
                      repeatCount="indefinite"
                      path={`M${origem.x},${origem.y} L${destino.x},${destino.y}`}
                    />
                  </circle>
                )}
                
                <text
                  x={(origem.x + destino.x) / 2}
                  y={(origem.y + destino.y) / 2 - 8}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {conexao.latencia}ms
                </text>
              </g>
            );
          })}
        </svg>

        {/* Preview do dispositivo ao adicionar */}
        {ferramentaAtiva === 'add-device' && dispositivoParaAdicionar && (
          <div
            className="absolute pointer-events-none opacity-50"
            style={{ left: mousePos.x - 30, top: mousePos.y - 30 }}
          >
            <div className="device-node bg-bahia-azul/50 border-2 border-dashed border-white/50">
              <IconeDispositivo tipo={dispositivoParaAdicionar} className="w-6 h-6 text-white/70" />
            </div>
          </div>
        )}

        {/* Renderiza dispositivos */}
        <AnimatePresence>
          {dispositivos.map((dispositivo, index) => {
            const isConexaoOrigem = conexaoOrigem === dispositivo.id;
            const canConnect = ferramentaAtiva === 'add-connection' && conexaoOrigem && conexaoOrigem !== dispositivo.id;
            const isMultiSelected = dispositivosSelecionados.has(dispositivo.id);
            const isSingleSelected = dispositivoSelecionado?.id === dispositivo.id;
            
            return (
              <motion.div
                key={dispositivo.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: dispositivo.x - 30,
                  y: dispositivo.y - 30,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  delay: index * 0.02,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={`device ${corStatus[dispositivo.status]} ${
                  isSingleSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                } ${isMultiSelected ? 'ring-2 ring-bahia-azul shadow-lg shadow-bahia-azul/30' : ''
                } ${caminhoDestacado.includes(dispositivo.id) ? 'z-30' : ''} ${
                  isConexaoOrigem ? 'ring-2 ring-blue-400 animate-pulse' : ''
                } ${canConnect ? 'ring-2 ring-green-400' : ''} ${
                  ferramentaAtiva === 'delete' ? 'hover:ring-2 hover:ring-red-500' : ''
                }`}
                style={{ 
                  position: 'absolute',
                  cursor: ferramentaAtiva === 'select' 
                    ? ((arrastando === dispositivo.id || arrastandoMultiplos) ? 'grabbing' : 'grab')
                    : 'pointer',
                  zIndex: isMultiSelected ? 20 : 10,
                }}
                onMouseDown={(e) => handleDeviceMouseDown(e, dispositivo)}
                onClick={(e) => handleDeviceClick(e, dispositivo)}
              >
                <div 
                  className={`device-node ${
                    caminhoDestacado.includes(dispositivo.id) 
                      ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/50' 
                      : ''
                  }`}
                >
                  <div className="relative z-10">
                    <IconeDispositivo tipo={dispositivo.tipo} />
                  </div>
                  
                  {dispositivo.cargaAtual > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-yellow-500 rounded-b"
                      style={{ width: `${dispositivo.cargaAtual}%` }}
                    />
                  )}
                </div>
                
                <span className="device-label">
                  {dispositivo.nome}
                </span>

                {dispositivo.status === StatusDispositivo.COMPROMETIDO && (
                  <span className="absolute -top-1 -right-1">
                    <IoWarning className="w-4 h-4 text-yellow-500" />
                  </span>
                )}
                {dispositivo.status === StatusDispositivo.OFFLINE && (
                  <span className="absolute -top-1 -right-1">
                    <BiError className="w-4 h-4 text-red-500" />
                  </span>
                )}
                
                {/* Badge de seleção múltipla */}
                {isMultiSelected && dispositivosSelecionados.size > 1 && (
                  <span className="absolute -top-2 -left-2 w-4 h-4 bg-bahia-azul rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-white/60 bg-black/30 p-2 rounded-lg">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Online
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Offline
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" /> Congestionado
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" /> Comprometido
          </div>
        </div>

        {/* Contador */}
        <div className="absolute bottom-4 right-4 text-xs text-white/40 bg-black/30 px-3 py-1.5 rounded-lg">
          {dispositivos.length} dispositivos • {conexoes.length} conexões
        </div>
      </div>
    </div>
  );
}
