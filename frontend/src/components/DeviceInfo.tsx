'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dispositivo, StatusDispositivo, TipoDispositivo } from '@/types';
import { 
  HiDesktopComputer, 
  HiServer,
  HiShieldCheck,
  HiX
} from 'react-icons/hi';
import { 
  FaNetworkWired, 
  FaServer,
  FaExchangeAlt,
  FaBolt,
} from 'react-icons/fa';
import { ReactNode } from 'react';

interface DeviceInfoProps {
  dispositivo: Dispositivo | null;
  onClose: () => void;
}

const IconeDispositivo = ({ tipo }: { tipo: TipoDispositivo }): ReactNode => {
  const iconClass = "w-6 h-6 text-white";
  switch (tipo) {
    case TipoDispositivo.HOST:
      return <HiDesktopComputer className={iconClass} />;
    case TipoDispositivo.ROTEADOR:
      return <FaNetworkWired className={iconClass} />;
    case TipoDispositivo.SWITCH:
      return <FaExchangeAlt className={iconClass} />;
    case TipoDispositivo.HUB:
      return <FaBolt className={iconClass} />;
    case TipoDispositivo.FIREWALL:
      return <HiShieldCheck className={iconClass} />;
    case TipoDispositivo.SERVIDOR:
      return <FaServer className={iconClass} />;
    default:
      return <HiServer className={iconClass} />;
  }
};

const statusInfo: Record<StatusDispositivo, { color: string; label: string }> = {
  ONLINE: { color: 'bg-green-500', label: 'Online' },
  OFFLINE: { color: 'bg-red-500', label: 'Offline' },
  CONGESTIONADO: { color: 'bg-yellow-500', label: 'Congestionado' },
  MANUTENCAO: { color: 'bg-gray-500', label: 'Em Manutenção' },
  COMPROMETIDO: { color: 'bg-purple-500', label: 'Comprometido' },
};

export function DeviceInfo({ dispositivo, onClose }: DeviceInfoProps) {
  if (!dispositivo) return null;

  return (
    <AnimatePresence>
      {dispositivo && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="panel"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bahia-azul to-bahia-vermelho flex items-center justify-center">
                <IconeDispositivo tipo={dispositivo.tipo} />
              </div>
              <div>
                <h3 className="font-display text-xl">{dispositivo.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${statusInfo[dispositivo.status].color}`} />
                  <span className="text-sm text-white/60">
                    {statusInfo[dispositivo.status].label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <HiX className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-white/40 text-xs">Tipo</span>
              <p className="font-medium">{dispositivo.tipo}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-white/40 text-xs">IP</span>
              <p className="font-medium font-mono">{dispositivo.ip}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-white/40 text-xs">MAC</span>
              <p className="font-medium font-mono text-xs">{dispositivo.mac}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-white/40 text-xs">Pacotes Processados</span>
              <p className="font-medium">{dispositivo.pacotesProcessados}</p>
            </div>
          </div>

          {/* Barra de carga */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">Carga de Processamento</span>
              <span className={dispositivo.cargaAtual > 80 ? 'text-red-400' : 'text-white/60'}>
                {dispositivo.cargaAtual}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dispositivo.cargaAtual}%` }}
                className={`h-full rounded-full ${
                  dispositivo.cargaAtual > 80 
                    ? 'bg-gradient-to-r from-yellow-500 to-red-500' 
                    : 'bg-gradient-to-r from-bahia-azul to-green-500'
                }`}
              />
            </div>
          </div>

          {/* Barra de capacidade */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">Capacidade de Processamento</span>
              <span className="text-white/60">{dispositivo.capacidadeProcessamento}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bahia-vermelho to-bahia-azul"
                style={{ width: `${dispositivo.capacidadeProcessamento}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
