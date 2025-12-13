'use client';

import { motion } from 'framer-motion';
import { MetricasRede } from '@/types';
import { 
  HiStatusOnline, 
  HiLink, 
  HiOutlineMail, 
  HiCheck, 
  HiX, 
  HiClock,
  HiChartBar,
  HiExclamation
} from 'react-icons/hi';
import { FaChartLine } from 'react-icons/fa';
import { ReactNode } from 'react';

interface MetricsPanelProps {
  metricas: MetricasRede | null;
}

interface MetricCard {
  label: string;
  value: string;
  color: string;
  icon: ReactNode;
}

export function MetricsPanel({ metricas }: MetricsPanelProps) {
  if (!metricas) return null;

  const cards: MetricCard[] = [
    {
      label: 'Dispositivos Online',
      value: `${metricas.dispositivosOnline}/${metricas.totalDispositivos}`,
      color: 'text-green-400',
      icon: <HiStatusOnline className="w-5 h-5 text-green-400" />,
    },
    {
      label: 'Conexões Ativas',
      value: `${metricas.conexoesAtivas}/${metricas.totalConexoes}`,
      color: 'text-blue-400',
      icon: <HiLink className="w-5 h-5 text-blue-400" />,
    },
    {
      label: 'Pacotes Enviados',
      value: metricas.pacotesEnviados.toString(),
      color: 'text-bahia-vermelho',
      icon: <HiOutlineMail className="w-5 h-5 text-bahia-vermelho" />,
    },
    {
      label: 'Pacotes Entregues',
      value: metricas.pacotesEntregues.toString(),
      color: 'text-green-400',
      icon: <HiCheck className="w-5 h-5 text-green-400" />,
    },
    {
      label: 'Pacotes Perdidos',
      value: metricas.pacotesPerdidos.toString(),
      color: 'text-red-400',
      icon: <HiX className="w-5 h-5 text-red-400" />,
    },
    {
      label: 'Latência Média',
      value: `${metricas.latenciaMedia.toFixed(1)}ms`,
      color: 'text-yellow-400',
      icon: <HiClock className="w-5 h-5 text-yellow-400" />,
    },
    {
      label: 'Throughput',
      value: `${(metricas.throughputTotal / 1000).toFixed(1)} Gbps`,
      color: 'text-purple-400',
      icon: <HiChartBar className="w-5 h-5 text-purple-400" />,
    },
    {
      label: 'Gargalos',
      value: metricas.congestionamentos.toString(),
      color: metricas.congestionamentos > 0 ? 'text-orange-400' : 'text-green-400',
      icon: <HiExclamation className={`w-5 h-5 ${metricas.congestionamentos > 0 ? 'text-orange-400' : 'text-green-400'}`} />,
    },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <FaChartLine className="w-6 h-6 text-bahia-vermelho" />
        <h2 className="panel-title">Métricas da Rede</h2>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="metric-card"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {card.icon}
              <span className={`metric-value ${card.color}`} style={{ 
                background: 'none', 
                WebkitTextFillColor: 'inherit',
                fontSize: '1.5rem' 
              }}>
                {card.value}
              </span>
            </div>
            <div className="metric-label">{card.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

