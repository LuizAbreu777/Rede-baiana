# 🌴 REDE BAIANA

## Simulador de Infraestrutura de Rede

![Bahia Flag Colors](https://img.shields.io/badge/Cores-Vermelho%20%7C%20Branco%20%7C%20Azul-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.3-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

> Projeto desenvolvido para a disciplina de **Algoritmos e Estruturas de Dados**

---

## 📋 Sobre o Projeto

O **Rede Baiana** é um simulador completo de infraestrutura de rede de computadores, onde cada dispositivo é representado como um **nó (vértice)** e cada conexão como uma **aresta** de um **grafo ponderado e direcionado**.

### 🎯 Objetivos

- Implementar estruturas de dados de **Grafo** do zero (sem bibliotecas externas)
- Demonstrar algoritmos clássicos de grafos (Dijkstra, BFS, DFS)
- Simular cenários reais de redes (tráfego, falhas, ataques)
- Visualização interativa da estrutura do grafo

---

## 🏗️ Arquitetura

```
rede-baiana/
├── backend/          # API NestJS
│   └── src/
│       └── rede/     # Módulo principal com implementação do Grafo
├── frontend/         # Interface Next.js
│   └── src/
│       ├── components/  # Componentes React
│       ├── hooks/       # Custom hooks
│       └── types/       # Tipos TypeScript
└── shared/           # Tipos compartilhados
    └── src/
        └── estruturas/  # Implementação do Grafo
```

---

## 🧠 Estrutura de Dados: Grafo

### Por que Grafo?

Redes de computadores são naturalmente representadas como grafos porque:
- Dispositivos são **nós** (vértices)
- Conexões são **arestas** com propriedades (latência, banda, etc.)
- Podem existir **múltiplos caminhos** entre dispositivos
- A topologia pode ter **ciclos**

### Implementação: Lista de Adjacência

Escolhemos **Lista de Adjacência** porque:
- ✅ Eficiente em memória para grafos esparsos
- ✅ Inserção e remoção de arestas O(1)
- ✅ Iteração sobre vizinhos O(grau do vértice)
- ✅ Redes são tipicamente esparsas

### Complexidades

| Operação | Complexidade |
|----------|--------------|
| Adicionar Vértice | O(1) |
| Adicionar Aresta | O(1) |
| Remover Vértice | O(V + E) |
| Remover Aresta | O(grau) |
| Dijkstra | O((V + E) log V) |
| BFS / DFS | O(V + E) |

---

## 🔍 Algoritmos Implementados

### 1. Dijkstra (Menor Caminho Ponderado)
```
Encontra o caminho de menor custo considerando:
- Latência da conexão
- Banda disponível
- Taxa de perda de pacotes
```

### 2. BFS (Breadth-First Search)
```
Encontra o caminho com menor número de saltos.
Útil quando queremos minimizar a quantidade de dispositivos intermediários.
```

### 3. DFS (Depth-First Search)
```
Explora o mais fundo possível antes de retroceder.
Usado para detecção de componentes conectados.
```

### 4. Componentes Conectados
```
Identifica partes isoladas da rede.
Crucial para detectar dispositivos que ficaram sem acesso.
```

---

## 🎮 Funcionalidades

### 📡 Gerenciamento de Dispositivos
- Adicionar/remover dispositivos (Host, Roteador, Switch, etc.)
- Arrastar dispositivos para reorganizar o mapa
- Visualizar status em tempo real

### 🔗 Gerenciamento de Conexões
- Criar/remover conexões entre dispositivos
- Configurar latência, banda e tipo de conexão
- Conexões bidirecionais ou unidirecionais

### 📨 Simulação de Tráfego
- Enviar pacotes entre dispositivos
- Escolher algoritmo de roteamento
- Visualizar caminho percorrido

### 💥 Simulação de Falhas
- Derrubar dispositivos
- Desconectar links
- Verificar impacto na rede

### ⚔️ Simulação de Ataques
- DoS (Denial of Service)
- DDoS (Distributed DoS)
- Malware (propagação)
- Man in the Middle
- Roteador Malicioso

### 📊 Métricas em Tempo Real
- Dispositivos online/offline
- Pacotes enviados/entregues/perdidos
- Latência média
- Detecção de gargalos

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd rede-baiana

# Instale as dependências
npm run install:all
# ou
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Executar em Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Acessar

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3333

---

## 🎨 Design Visual

### Cores da Bandeira da Bahia

| Cor | Código | Uso |
|-----|--------|-----|
| 🔴 Vermelho | #D52B1E | Ações, destaques, botões primários |
| 🔵 Azul | #00529F | Elementos interativos, links |
| ⚪ Branco | #FFFFFF | Textos, contrastes |

### Mascote: Baianinho

O mascote oferece dicas e orientações sobre o uso do sistema! 🌴

---

## 📚 Referências Técnicas

### Grafo - Conceitos Utilizados
- **Vértice:** Dispositivo de rede
- **Aresta:** Conexão entre dispositivos
- **Peso:** Calculado com base em latência, banda e perda
- **Grafo Ponderado:** Arestas têm custos diferentes
- **Grafo Direcionado:** Conexões podem ser unidirecionais

### Estruturas de Dados
- Lista de Adjacência (Lista Encadeada)
- Heap Mínimo (para Dijkstra)
- Fila (para BFS)
- Pilha (para DFS)
- Map/Set (para controle de visitados)

---

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Socket.IO** - Comunicação em tempo real
- **TypeScript** - Tipagem estática

### Frontend
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Socket.IO Client** - Conexão WebSocket

---

## 👥 Equipe

Desenvolvido por estudantes de Algoritmos e Estruturas de Dados.

---

## 📝 Licença

Este projeto é para fins educacionais.

---

<div align="center">

### 🌴 Ô xente, bora simular essa rede! 🌴

**REDE BAIANA** - Onde a tecnologia encontra o axé!

</div>

