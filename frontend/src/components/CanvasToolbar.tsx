'use client';

import { motion } from 'framer-motion';
import { 
  HiCursorClick, 
  HiLink, 
  HiTrash,
  HiPlus,
  HiReply,
  HiArrowRight,
} from 'react-icons/hi';
import { 
  FaNetworkWired, 
  FaServer,
  FaExchangeAlt,
  FaBolt,
  FaDesktop,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import { MdShield } from 'react-icons/md';
import { TipoDispositivo } from '@/types';
import { ReactNode } from 'react';

export type ToolType = 'select' | 'add-device' | 'add-connection' | 'delete';

interface CanvasToolbarProps {
  ferramentaAtiva: ToolType;
  dispositivoParaAdicionar: TipoDispositivo | null;
  podeDesfazer: boolean;
  podeRefazer: boolean;
  onSelectTool: (tool: ToolType) => void;
  onSelectDeviceType: (tipo: TipoDispositivo | null) => void;
  onDesfazer: () => void;
  onRefazer: () => void;
}

interface DeviceOption {
  tipo: TipoDispositivo;
  nome: string;
  icon: ReactNode;
  cor: string;
}

const dispositivos: DeviceOption[] = [
  { tipo: TipoDispositivo.HOST, nome: 'Host/PC', icon: <FaDesktop />, cor: 'text-blue-400' },
  { tipo: TipoDispositivo.SERVIDOR, nome: 'Servidor', icon: <FaServer />, cor: 'text-green-400' },
  { tipo: TipoDispositivo.ROTEADOR, nome: 'Roteador', icon: <FaNetworkWired />, cor: 'text-yellow-400' },
  { tipo: TipoDispositivo.SWITCH, nome: 'Switch', icon: <FaExchangeAlt />, cor: 'text-purple-400' },
  { tipo: TipoDispositivo.HUB, nome: 'Hub', icon: <FaBolt />, cor: 'text-orange-400' },
  { tipo: TipoDispositivo.FIREWALL, nome: 'Firewall', icon: <MdShield />, cor: 'text-red-400' },
];

export function CanvasToolbar({
  ferramentaAtiva,
  dispositivoParaAdicionar,
  podeDesfazer,
  podeRefazer,
  onSelectTool,
  onSelectDeviceType,
  onDesfazer,
  onRefazer,
}: CanvasToolbarProps) {
  
  const handleDeviceSelect = (tipo: TipoDispositivo) => {
    onSelectTool('add-device');
    onSelectDeviceType(tipo);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar Principal */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex-wrap"
      >
        {/* Desfazer / Refazer */}
        <button
          onClick={onDesfazer}
          disabled={!podeDesfazer}
          className={`toolbar-btn ${!podeDesfazer ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
          title="Desfazer (Ctrl+Z)"
        >
          <FaUndo className="w-4 h-4" />
        </button>
        <button
          onClick={onRefazer}
          disabled={!podeRefazer}
          className={`toolbar-btn ${!podeRefazer ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
          title="Refazer (Ctrl+Y)"
        >
          <FaRedo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Ferramenta: Selecionar */}
        <button
          onClick={() => {
            onSelectTool('select');
            onSelectDeviceType(null);
          }}
          className={`toolbar-btn ${ferramentaAtiva === 'select' ? 'toolbar-btn-active' : ''}`}
          title="Selecionar / Mover (V)"
        >
          <HiCursorClick className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Dispositivos para adicionar */}
        {dispositivos.map((device) => (
          <button
            key={device.tipo}
            onClick={() => handleDeviceSelect(device.tipo)}
            className={`toolbar-btn ${
              ferramentaAtiva === 'add-device' && dispositivoParaAdicionar === device.tipo 
                ? 'toolbar-btn-active' 
                : ''
            } ${device.cor}`}
            title={`Adicionar ${device.nome}`}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {device.icon}
            </span>
          </button>
        ))}

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Ferramenta: Conexão */}
        <button
          onClick={() => {
            onSelectTool('add-connection');
            onSelectDeviceType(null);
          }}
          className={`toolbar-btn ${ferramentaAtiva === 'add-connection' ? 'toolbar-btn-active' : ''}`}
          title="Criar Conexão (C)"
        >
          <HiLink className="w-5 h-5 text-green-400" />
        </button>

        {/* Ferramenta: Deletar */}
        <button
          onClick={() => {
            onSelectTool('delete');
            onSelectDeviceType(null);
          }}
          className={`toolbar-btn ${ferramentaAtiva === 'delete' ? 'toolbar-btn-active' : ''}`}
          title="Deletar (Del)"
        >
          <HiTrash className="w-5 h-5 text-red-400" />
        </button>
      </motion.div>

      {/* Indicador de ferramenta ativa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg text-xs"
      >
        {ferramentaAtiva === 'select' && (
          <>
            <HiCursorClick className="w-4 h-4 text-white/60" />
            <span className="text-white/60">Clique para selecionar, arraste para mover • Ctrl+Z desfazer</span>
          </>
        )}
        {ferramentaAtiva === 'add-device' && dispositivoParaAdicionar && (
          <>
            <HiPlus className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              Clique no canvas para adicionar {dispositivos.find(d => d.tipo === dispositivoParaAdicionar)?.nome}
            </span>
          </>
        )}
        {ferramentaAtiva === 'add-connection' && (
          <>
            <HiLink className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">Clique em dois dispositivos para conectar</span>
          </>
        )}
        {ferramentaAtiva === 'delete' && (
          <>
            <HiTrash className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Clique em um dispositivo ou conexão para deletar</span>
          </>
        )}
      </motion.div>
    </div>
  );
}
