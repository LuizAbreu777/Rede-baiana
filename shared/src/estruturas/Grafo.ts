/**
 * ============================================
 * REDE BAIANA - IMPLEMENTAÇÃO DO GRAFO
 * ============================================
 * 
 * IMPLEMENTAÇÃO PRÓPRIA - SEM BIBLIOTECAS EXTERNAS
 * 
 * Esta classe implementa um Grafo Ponderado e Direcionado
 * usando Lista de Adjacência como estrutura interna.
 * 
 * Justificativa da escolha:
 * - Lista de Adjacência é mais eficiente em memória para grafos esparsos
 * - Redes de computadores são tipicamente esparsas (não todo mundo conecta com todo mundo)
 * - Inserção e remoção de arestas é O(1) amortizado
 * - Iteração sobre vizinhos é O(grau do vértice)
 * 
 * Complexidades:
 * - Adicionar vértice: O(1)
 * - Adicionar aresta: O(1)
 * - Remover vértice: O(V + E)
 * - Remover aresta: O(grau)
 * - Buscar vizinhos: O(1) para acessar, O(grau) para iterar
 * - Dijkstra: O((V + E) log V) com heap
 * - BFS/DFS: O(V + E)
 */

import { Dispositivo, Conexao, ResultadoCaminho, ComponenteConectado } from '../types';

/**
 * Nó da lista de adjacência
 * Representa uma aresta saindo de um vértice
 */
class NoAdjacencia {
  public destinoId: string;
  public peso: number;
  public conexao: Conexao;
  public proximo: NoAdjacencia | null;

  constructor(destinoId: string, peso: number, conexao: Conexao) {
    this.destinoId = destinoId;
    this.peso = peso;
    this.conexao = conexao;
    this.proximo = null;
  }
}

/**
 * Lista de adjacência para um vértice
 * Implementada como lista encadeada para demonstrar estruturas de dados
 */
class ListaAdjacencia {
  public cabeca: NoAdjacencia | null;
  public tamanho: number;

  constructor() {
    this.cabeca = null;
    this.tamanho = 0;
  }

  /**
   * Adiciona uma aresta à lista
   * Complexidade: O(1)
   */
  adicionar(destinoId: string, peso: number, conexao: Conexao): void {
    const novoNo = new NoAdjacencia(destinoId, peso, conexao);
    novoNo.proximo = this.cabeca;
    this.cabeca = novoNo;
    this.tamanho++;
  }

  /**
   * Remove uma aresta da lista
   * Complexidade: O(n) onde n é o grau do vértice
   */
  remover(destinoId: string): boolean {
    if (!this.cabeca) return false;

    // Caso especial: remover o primeiro
    if (this.cabeca.destinoId === destinoId) {
      this.cabeca = this.cabeca.proximo;
      this.tamanho--;
      return true;
    }

    let atual = this.cabeca;
    while (atual.proximo) {
      if (atual.proximo.destinoId === destinoId) {
        atual.proximo = atual.proximo.proximo;
        this.tamanho--;
        return true;
      }
      atual = atual.proximo;
    }

    return false;
  }

  /**
   * Busca uma aresta na lista
   * Complexidade: O(n)
   */
  buscar(destinoId: string): NoAdjacencia | null {
    let atual = this.cabeca;
    while (atual) {
      if (atual.destinoId === destinoId) {
        return atual;
      }
      atual = atual.proximo;
    }
    return null;
  }

  /**
   * Retorna todos os vizinhos como array
   * Complexidade: O(n)
   */
  todosVizinhos(): NoAdjacencia[] {
    const vizinhos: NoAdjacencia[] = [];
    let atual = this.cabeca;
    while (atual) {
      vizinhos.push(atual);
      atual = atual.proximo;
    }
    return vizinhos;
  }

  /**
   * Verifica se existe conexão com destino
   * Complexidade: O(n)
   */
  existeConexao(destinoId: string): boolean {
    return this.buscar(destinoId) !== null;
  }
}

/**
 * Nó do Heap Mínimo para Dijkstra
 */
interface NoHeap {
  id: string;
  prioridade: number;
}

/**
 * Heap Mínimo (Min-Heap) - Implementação própria
 * Usado para otimizar o algoritmo de Dijkstra
 */
class HeapMinimo {
  private heap: NoHeap[];
  private posicoes: Map<string, number>;

  constructor() {
    this.heap = [];
    this.posicoes = new Map();
  }

  private pai(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private filhoEsquerdo(i: number): number {
    return 2 * i + 1;
  }

  private filhoDireito(i: number): number {
    return 2 * i + 2;
  }

  private trocar(i: number, j: number): void {
    this.posicoes.set(this.heap[i].id, j);
    this.posicoes.set(this.heap[j].id, i);
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private subir(i: number): void {
    while (i > 0 && this.heap[this.pai(i)].prioridade > this.heap[i].prioridade) {
      this.trocar(i, this.pai(i));
      i = this.pai(i);
    }
  }

  private descer(i: number): void {
    let menor = i;
    const esquerdo = this.filhoEsquerdo(i);
    const direito = this.filhoDireito(i);

    if (esquerdo < this.heap.length && 
        this.heap[esquerdo].prioridade < this.heap[menor].prioridade) {
      menor = esquerdo;
    }

    if (direito < this.heap.length && 
        this.heap[direito].prioridade < this.heap[menor].prioridade) {
      menor = direito;
    }

    if (menor !== i) {
      this.trocar(i, menor);
      this.descer(menor);
    }
  }

  inserir(id: string, prioridade: number): void {
    const no: NoHeap = { id, prioridade };
    this.heap.push(no);
    this.posicoes.set(id, this.heap.length - 1);
    this.subir(this.heap.length - 1);
  }

  extrairMinimo(): NoHeap | null {
    if (this.heap.length === 0) return null;

    const minimo = this.heap[0];
    const ultimo = this.heap.pop()!;
    this.posicoes.delete(minimo.id);

    if (this.heap.length > 0) {
      this.heap[0] = ultimo;
      this.posicoes.set(ultimo.id, 0);
      this.descer(0);
    }

    return minimo;
  }

  diminuirPrioridade(id: string, novaPrioridade: number): void {
    const posicao = this.posicoes.get(id);
    if (posicao !== undefined && novaPrioridade < this.heap[posicao].prioridade) {
      this.heap[posicao].prioridade = novaPrioridade;
      this.subir(posicao);
    }
  }

  contem(id: string): boolean {
    return this.posicoes.has(id);
  }

  estaVazio(): boolean {
    return this.heap.length === 0;
  }
}

/**
 * ============================================
 * CLASSE PRINCIPAL: GRAFO DE REDE
 * ============================================
 * 
 * Implementa um grafo ponderado e direcionado para
 * representar a infraestrutura de rede.
 */
export class GrafoRede {
  // Mapa de vértices (dispositivos)
  private vertices: Map<string, Dispositivo>;
  
  // Lista de adjacência para cada vértice
  private adjacencias: Map<string, ListaAdjacencia>;
  
  // Mapa de todas as conexões por ID
  private conexoes: Map<string, Conexao>;

  constructor() {
    this.vertices = new Map();
    this.adjacencias = new Map();
    this.conexoes = new Map();
  }

  // ============================================
  // OPERAÇÕES BÁSICAS DO GRAFO
  // ============================================

  /**
   * Adiciona um dispositivo (vértice) ao grafo
   * Complexidade: O(1)
   */
  adicionarDispositivo(dispositivo: Dispositivo): void {
    if (this.vertices.has(dispositivo.id)) {
      throw new Error(`Dispositivo com ID ${dispositivo.id} já existe`);
    }
    this.vertices.set(dispositivo.id, dispositivo);
    this.adjacencias.set(dispositivo.id, new ListaAdjacencia());
  }

  /**
   * Remove um dispositivo e todas suas conexões
   * Complexidade: O(V + E)
   */
  removerDispositivo(id: string): boolean {
    if (!this.vertices.has(id)) {
      return false;
    }

    // Remove todas as arestas que chegam neste vértice
    this.adjacencias.forEach((lista, origemId) => {
      if (origemId !== id) {
        const vizinhos = lista.todosVizinhos();
        for (const vizinho of vizinhos) {
          if (vizinho.destinoId === id) {
            lista.remover(id);
            this.conexoes.delete(vizinho.conexao.id);
          }
        }
      }
    });

    // Remove todas as arestas que saem deste vértice
    const listaDoVertice = this.adjacencias.get(id);
    if (listaDoVertice) {
      const vizinhos = listaDoVertice.todosVizinhos();
      for (const vizinho of vizinhos) {
        this.conexoes.delete(vizinho.conexao.id);
      }
    }

    // Remove o vértice
    this.vertices.delete(id);
    this.adjacencias.delete(id);
    return true;
  }

  /**
   * Adiciona uma conexão (aresta) entre dispositivos
   * Complexidade: O(1)
   */
  adicionarConexao(conexao: Conexao): void {
    if (!this.vertices.has(conexao.origem)) {
      throw new Error(`Dispositivo origem ${conexao.origem} não existe`);
    }
    if (!this.vertices.has(conexao.destino)) {
      throw new Error(`Dispositivo destino ${conexao.destino} não existe`);
    }

    // Calcula o peso da conexão baseado em latência, banda e perda
    const peso = this.calcularPesoConexao(conexao);
    conexao.peso = peso;

    // Adiciona na lista de adjacência
    const lista = this.adjacencias.get(conexao.origem)!;
    lista.adicionar(conexao.destino, peso, conexao);
    
    // Se bidirecional, adiciona no sentido contrário também
    if (conexao.bidirecional) {
      const listaReversa = this.adjacencias.get(conexao.destino)!;
      const conexaoReversa: Conexao = {
        ...conexao,
        id: `${conexao.id}_rev`,
        origem: conexao.destino,
        destino: conexao.origem,
      };
      listaReversa.adicionar(conexao.origem, peso, conexaoReversa);
    }

    this.conexoes.set(conexao.id, conexao);
  }

  /**
   * Remove uma conexão
   * Complexidade: O(grau)
   */
  removerConexao(conexaoId: string): boolean {
    const conexao = this.conexoes.get(conexaoId);
    if (!conexao) return false;

    const lista = this.adjacencias.get(conexao.origem);
    if (lista) {
      lista.remover(conexao.destino);
    }

    if (conexao.bidirecional) {
      const listaReversa = this.adjacencias.get(conexao.destino);
      if (listaReversa) {
        listaReversa.remover(conexao.origem);
      }
    }

    this.conexoes.delete(conexaoId);
    return true;
  }

  /**
   * Atualiza o peso de uma conexão
   */
  atualizarPesoConexao(conexaoId: string): void {
    const conexao = this.conexoes.get(conexaoId);
    if (!conexao) return;

    const novoPeso = this.calcularPesoConexao(conexao);
    conexao.peso = novoPeso;

    const lista = this.adjacencias.get(conexao.origem);
    if (lista) {
      const no = lista.buscar(conexao.destino);
      if (no) no.peso = novoPeso;
    }

    if (conexao.bidirecional) {
      const listaReversa = this.adjacencias.get(conexao.destino);
      if (listaReversa) {
        const noReverso = listaReversa.buscar(conexao.origem);
        if (noReverso) noReverso.peso = novoPeso;
      }
    }
  }

  /**
   * Calcula o peso da conexão baseado nas métricas
   * Fórmula: peso = latência + (100 - banda_disponível) + (perda * 10)
   */
  private calcularPesoConexao(conexao: Conexao): number {
    const bandaDisponivel = Math.max(0, conexao.banda - conexao.bandaUsada);
    const percentualBanda = (bandaDisponivel / conexao.banda) * 100;
    return conexao.latencia + (100 - percentualBanda) + (conexao.perda * 10);
  }

  // ============================================
  // ALGORITMOS DE BUSCA
  // ============================================

  /**
   * Busca em Largura (BFS) - Breadth-First Search
   * Encontra o caminho com menor número de saltos
   * Complexidade: O(V + E)
   */
  bfs(origemId: string, destinoId: string): ResultadoCaminho {
    if (!this.vertices.has(origemId) || !this.vertices.has(destinoId)) {
      return this.resultadoNaoEncontrado('BFS');
    }

    const visitados = new Set<string>();
    const predecessores = new Map<string, string>();
    const fila: string[] = [origemId];
    visitados.add(origemId);

    while (fila.length > 0) {
      const atual = fila.shift()!;

      if (atual === destinoId) {
        return this.reconstruirCaminho(origemId, destinoId, predecessores, 'BFS');
      }

      const lista = this.adjacencias.get(atual);
      if (lista) {
        for (const vizinho of lista.todosVizinhos()) {
          // Verifica se o dispositivo está online
          const dispositivo = this.vertices.get(vizinho.destinoId);
          if (!visitados.has(vizinho.destinoId) && 
              dispositivo?.status === 'ONLINE' &&
              vizinho.conexao.status === 'ATIVA') {
            visitados.add(vizinho.destinoId);
            predecessores.set(vizinho.destinoId, atual);
            fila.push(vizinho.destinoId);
          }
        }
      }
    }

    return this.resultadoNaoEncontrado('BFS');
  }

  /**
   * Busca em Profundidade (DFS) - Depth-First Search
   * Explora o mais fundo possível antes de retroceder
   * Complexidade: O(V + E)
   */
  dfs(origemId: string, destinoId: string): ResultadoCaminho {
    if (!this.vertices.has(origemId) || !this.vertices.has(destinoId)) {
      return this.resultadoNaoEncontrado('DFS');
    }

    const visitados = new Set<string>();
    const predecessores = new Map<string, string>();
    const pilha: string[] = [origemId];

    while (pilha.length > 0) {
      const atual = pilha.pop()!;

      if (atual === destinoId) {
        return this.reconstruirCaminho(origemId, destinoId, predecessores, 'DFS');
      }

      if (!visitados.has(atual)) {
        visitados.add(atual);

        const lista = this.adjacencias.get(atual);
        if (lista) {
          for (const vizinho of lista.todosVizinhos()) {
            const dispositivo = this.vertices.get(vizinho.destinoId);
            if (!visitados.has(vizinho.destinoId) && 
                dispositivo?.status === 'ONLINE' &&
                vizinho.conexao.status === 'ATIVA') {
              predecessores.set(vizinho.destinoId, atual);
              pilha.push(vizinho.destinoId);
            }
          }
        }
      }
    }

    return this.resultadoNaoEncontrado('DFS');
  }

  /**
   * Algoritmo de Dijkstra
   * Encontra o caminho de menor custo (considerando pesos)
   * Complexidade: O((V + E) log V) com heap
   */
  dijkstra(origemId: string, destinoId: string): ResultadoCaminho {
    if (!this.vertices.has(origemId) || !this.vertices.has(destinoId)) {
      return this.resultadoNaoEncontrado('DIJKSTRA');
    }

    const distancias = new Map<string, number>();
    const predecessores = new Map<string, string>();
    const heap = new HeapMinimo();

    // Inicializa distâncias
    this.vertices.forEach((_, id) => {
      distancias.set(id, id === origemId ? 0 : Infinity);
    });

    heap.inserir(origemId, 0);

    while (!heap.estaVazio()) {
      const minimo = heap.extrairMinimo()!;
      const atualId = minimo.id;
      const distAtual = distancias.get(atualId)!;

      if (atualId === destinoId) {
        return this.reconstruirCaminho(origemId, destinoId, predecessores, 'DIJKSTRA');
      }

      const lista = this.adjacencias.get(atualId);
      if (lista) {
        for (const vizinho of lista.todosVizinhos()) {
          const dispositivo = this.vertices.get(vizinho.destinoId);
          
          // Só considera dispositivos online e conexões ativas
          if (dispositivo?.status !== 'ONLINE' || 
              vizinho.conexao.status !== 'ATIVA') {
            continue;
          }

          const novaDistancia = distAtual + vizinho.peso;
          const distVizinho = distancias.get(vizinho.destinoId)!;

          if (novaDistancia < distVizinho) {
            distancias.set(vizinho.destinoId, novaDistancia);
            predecessores.set(vizinho.destinoId, atualId);

            if (heap.contem(vizinho.destinoId)) {
              heap.diminuirPrioridade(vizinho.destinoId, novaDistancia);
            } else {
              heap.inserir(vizinho.destinoId, novaDistancia);
            }
          }
        }
      }
    }

    return this.resultadoNaoEncontrado('DIJKSTRA');
  }

  /**
   * Reconstrói o caminho a partir dos predecessores
   */
  private reconstruirCaminho(
    origemId: string, 
    destinoId: string, 
    predecessores: Map<string, string>,
    algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' | 'BELLMAN_FORD'
  ): ResultadoCaminho {
    const caminho: string[] = [];
    let atual: string | undefined = destinoId;

    while (atual) {
      caminho.unshift(atual);
      atual = predecessores.get(atual);
    }

    // Calcula métricas do caminho
    let custoTotal = 0;
    let latenciaTotal = 0;

    for (let i = 0; i < caminho.length - 1; i++) {
      const lista = this.adjacencias.get(caminho[i]);
      if (lista) {
        const aresta = lista.buscar(caminho[i + 1]);
        if (aresta) {
          custoTotal += aresta.peso;
          latenciaTotal += aresta.conexao.latencia;
        }
      }
    }

    return {
      encontrado: true,
      caminho,
      custoTotal,
      distancia: custoTotal,
      latenciaEstimada: latenciaTotal,
      saltos: caminho.length - 1,
      algoritmoUsado: algoritmo,
    };
  }

  private resultadoNaoEncontrado(algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' | 'BELLMAN_FORD'): ResultadoCaminho {
    return {
      encontrado: false,
      caminho: [],
      custoTotal: Infinity,
      distancia: Infinity,
      latenciaEstimada: Infinity,
      saltos: 0,
      algoritmoUsado: algoritmo,
    };
  }

  // ============================================
  // ANÁLISES DO GRAFO
  // ============================================

  /**
   * Encontra todos os componentes conectados
   * Útil para detectar partes isoladas da rede
   * Complexidade: O(V + E)
   */
  componentesConectados(): ComponenteConectado[] {
    const visitados = new Set<string>();
    const componentes: ComponenteConectado[] = [];
    let componenteId = 0;

    this.vertices.forEach((_, verticeId) => {
      if (!visitados.has(verticeId)) {
        const dispositivos: string[] = [];
        this.dfsComponente(verticeId, visitados, dispositivos);
        
        componentes.push({
          id: componenteId++,
          dispositivos,
          tamanho: dispositivos.length,
          isolado: dispositivos.length === 1,
        });
      }
    });

    return componentes;
  }

  private dfsComponente(verticeId: string, visitados: Set<string>, dispositivos: string[]): void {
    visitados.add(verticeId);
    dispositivos.push(verticeId);

    const lista = this.adjacencias.get(verticeId);
    if (lista) {
      for (const vizinho of lista.todosVizinhos()) {
        if (!visitados.has(vizinho.destinoId)) {
          this.dfsComponente(vizinho.destinoId, visitados, dispositivos);
        }
      }
    }

    // Para grafos não-direcionados, também verificar arestas de entrada
    this.adjacencias.forEach((listaAdj, origemId) => {
      if (!visitados.has(origemId)) {
        const vizinhos = listaAdj.todosVizinhos();
        for (const v of vizinhos) {
          if (v.destinoId === verticeId) {
            this.dfsComponente(origemId, visitados, dispositivos);
          }
        }
      }
    });
  }

  /**
   * Detecta gargalos na rede (links mais congestionados)
   */
  detectarGargalos(): Conexao[] {
    const gargalos: Conexao[] = [];
    
    this.conexoes.forEach(conexao => {
      const utilizacao = (conexao.bandaUsada / conexao.banda) * 100;
      if (utilizacao > 80) {
        gargalos.push(conexao);
      }
    });

    return gargalos.sort((a, b) => 
      (b.bandaUsada / b.banda) - (a.bandaUsada / a.banda)
    );
  }

  /**
   * Calcula o grau de cada vértice (número de conexões)
   */
  calcularGraus(): Map<string, { entrada: number; saida: number; total: number }> {
    const graus = new Map<string, { entrada: number; saida: number; total: number }>();

    this.vertices.forEach((_, id) => {
      graus.set(id, { entrada: 0, saida: 0, total: 0 });
    });

    this.adjacencias.forEach((lista, origemId) => {
      const grauOrigem = graus.get(origemId)!;
      grauOrigem.saida = lista.tamanho;
      grauOrigem.total += lista.tamanho;

      for (const vizinho of lista.todosVizinhos()) {
        const grauDestino = graus.get(vizinho.destinoId);
        if (grauDestino) {
          grauDestino.entrada++;
          grauDestino.total++;
        }
      }
    });

    return graus;
  }

  /**
   * Encontra pontos de articulação (dispositivos críticos)
   * Se removidos, desconectam partes da rede
   */
  pontosDeArticulacao(): string[] {
    const articulacoes: string[] = [];
    const componentesOriginal = this.componentesConectados().length;

    this.vertices.forEach((dispositivo, id) => {
      // Simula remoção temporária
      const statusOriginal = dispositivo.status;
      dispositivo.status = 'OFFLINE' as any;

      const componentesAposRemocao = this.componentesConectados().filter(c => 
        !c.dispositivos.every(d => this.vertices.get(d)?.status === 'OFFLINE')
      ).length;

      if (componentesAposRemocao > componentesOriginal) {
        articulacoes.push(id);
      }

      dispositivo.status = statusOriginal;
    });

    return articulacoes;
  }

  // ============================================
  // GETTERS E UTILITÁRIOS
  // ============================================

  getDispositivo(id: string): Dispositivo | undefined {
    return this.vertices.get(id);
  }

  getConexao(id: string): Conexao | undefined {
    return this.conexoes.get(id);
  }

  getTodosDispositivos(): Dispositivo[] {
    return Array.from(this.vertices.values());
  }

  getTodasConexoes(): Conexao[] {
    return Array.from(this.conexoes.values());
  }

  getVizinhos(id: string): Dispositivo[] {
    const lista = this.adjacencias.get(id);
    if (!lista) return [];

    return lista.todosVizinhos()
      .map(v => this.vertices.get(v.destinoId))
      .filter((d): d is Dispositivo => d !== undefined);
  }

  getConexoesDoDispositivo(id: string): Conexao[] {
    const lista = this.adjacencias.get(id);
    if (!lista) return [];
    return lista.todosVizinhos().map(v => v.conexao);
  }

  get totalVertices(): number {
    return this.vertices.size;
  }

  get totalArestas(): number {
    return this.conexoes.size;
  }

  /**
   * Exporta o grafo para JSON (para visualização)
   */
  exportarParaJSON(): { nodes: Dispositivo[]; edges: Conexao[] } {
    return {
      nodes: this.getTodosDispositivos(),
      edges: this.getTodasConexoes(),
    };
  }

  /**
   * Limpa todo o grafo
   */
  limpar(): void {
    this.vertices.clear();
    this.adjacencias.clear();
    this.conexoes.clear();
  }
}

