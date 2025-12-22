'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaNetworkWired, FaQuestionCircle } from 'react-icons/fa';
import { GiPalmTree } from 'react-icons/gi';
import Image from 'next/image';

const dicas = [
  "Ôxente! Clique em um dispositivo pra ver mais detalhes!",
  "Tá ligado? Use o Dijkstra pra achar o melhor caminho!",
  "Eita! Simule falhas pra testar a resiliência da rede!",
  "Arretado! Arraste os dispositivos pra reorganizar o mapa!",
  "Oxe! DDoS pode derrubar até servidor forte!",
  "Massa! BFS encontra o caminho com menos saltos!",
  "Vixe! Dispositivo offline pode isolar partes da rede!",
];

export function Mascote() {
  const [mostrarDica, setMostrarDica] = useState(false);
  const [dicaAtual, setDicaAtual] = useState(0);

  const handleClick = () => {
    setMostrarDica(!mostrarDica);
    setDicaAtual(Math.floor(Math.random() * dicas.length));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {mostrarDica && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-3 w-72 p-4 rounded-2xl bg-white text-gray-800 shadow-xl"
          >
            {/* Seta */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45" />
            
            <p className="text-sm font-medium relative z-10">
              {dicas[dicaAtual]}
            </p>
            
            <div className="mt-2 text-xs text-gray-500 text-right flex items-center justify-end gap-1">
              — Baianinho <GiPalmTree className="w-4 h-4 text-green-600" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão do mascote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-bahia-vermelho via-white to-bahia-azul p-1 shadow-2xl cursor-pointer group"
        style={{
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-bahia-azul to-bahia-vermelho flex items-center justify-center overflow-hidden">
          <Image
          src="/Mascote.png"
          alt="Mascote do chatbot"
          width={80}
          height={80}
          className="object-cover"
          />
        </div>
        
        {/* Brilho */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
        </div>
        
        {/* Badge de ajuda */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
        >
          <FaQuestionCircle className="w-4 h-4 text-yellow-800" />
        </motion.div>
      </motion.button>
    </div>
  );
}
