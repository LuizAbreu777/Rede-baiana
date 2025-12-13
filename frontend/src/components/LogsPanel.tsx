'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogEvento } from '@/types';
import { ReactNode } from 'react';
import { 
  HiInformationCircle, 
  HiCheckCircle, 
  HiExclamation, 
  HiXCircle,
  HiClipboardList 
} from 'react-icons/hi';
import { GiCrossedSwords } from 'react-icons/gi';

interface LogsPanelProps {
  logs: LogEvento[];
}

const logClasses: Record<string, string> = {
  INFO: 'log-info',
  SUCCESS: 'log-success',
  WARNING: 'log-warning',
  ERROR: 'log-error',
  ATTACK: 'log-attack',
};

const LogIcon = ({ tipo }: { tipo: string }): ReactNode => {
  const baseClass = "w-4 h-4 flex-shrink-0";
  switch (tipo) {
    case 'INFO':
      return <HiInformationCircle className={`${baseClass} text-blue-400`} />;
    case 'SUCCESS':
      return <HiCheckCircle className={`${baseClass} text-green-400`} />;
    case 'WARNING':
      return <HiExclamation className={`${baseClass} text-yellow-400`} />;
    case 'ERROR':
      return <HiXCircle className={`${baseClass} text-red-400`} />;
    case 'ATTACK':
      return <GiCrossedSwords className={`${baseClass} text-purple-400`} />;
    default:
      return <HiInformationCircle className={`${baseClass} text-gray-400`} />;
  }
};

export function LogsPanel({ logs }: LogsPanelProps) {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <HiClipboardList className="w-6 h-6 text-bahia-azul" />
        <h2 className="panel-title">Logs do Sistema</h2>
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <p className="text-center text-white/40 py-4">
              Nenhum evento registrado
            </p>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className={`log-entry ${logClasses[log.tipo]}`}
              >
                <LogIcon tipo={log.tipo} />
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span className="flex-1 text-white/80 text-sm">{log.mensagem}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
