'use client';

import { motion } from 'framer-motion';
import { HiRefresh, HiStatusOnline, HiStatusOffline } from 'react-icons/hi';
import { FaNetworkWired } from 'react-icons/fa';

interface HeaderProps {
  conectado: boolean;
  onResetar: () => void;
}

export function Header({ conectado, onResetar }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo e Título */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Ícone de Rede com cores da Bahia */}
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-bahia-vermelho via-white to-bahia-azul p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-bahia-azul to-[#1a1a2e] flex items-center justify-center">
                <FaNetworkWired className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-3xl tracking-wider text-white truncate">
                REDE BAIANA
              </h1>
              <p className="text-[10px] sm:text-xs text-white/60 tracking-widest hidden sm:block">
                SIMULADOR DE INFRAESTRUTURA DE REDE
              </p>
            </div>
          </div>

          {/* Status e Ações */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Status de Conexão */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10">
              {conectado ? (
                <HiStatusOnline className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
              ) : (
                <HiStatusOffline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              )}
              <span className="text-xs sm:text-sm text-white/80 hidden xs:inline">
                {conectado ? 'Conectado' : 'Offline'}
              </span>
            </div>

            {/* Botão Resetar */}
            <button
              onClick={onResetar}
              className="btn btn-ghost text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
            >
              <HiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Linha decorativa */}
      <div className="h-0.5 sm:h-1 w-full bg-gradient-to-r from-bahia-vermelho via-white to-bahia-azul opacity-50" />
    </motion.header>
  );
}
