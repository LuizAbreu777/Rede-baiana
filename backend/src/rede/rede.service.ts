import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Dispositivo,
  Conexao,
  Pacote,
  Ataque,
  TipoDispositivo,
  StatusDispositivo,
  TipoConexao,
  StatusConexao,
  TipoAtaque,
  MetricasRede,
  ResultadoCaminho,
  ComponenteConectado,
  LogEvento,
  CriarDispositivoDto,
  CriarConexaoDto,
  EnviarPacoteDto,
  SimularAtaqueDto,
} from './types';
import { dispositivosSeed, conexoesSeedDef, logsIniciais } from './seed';

/**
 * ============================================
 * NÓ DA LISTA DE ADJACÊNCIA
 * ============================================
 */
class NoAdjacencia {
  constructor(
    public destinoId: string,
    public peso: number,
    public conexao: Conexao,
    public proximo: NoAdjacencia | null = null,
  ) {}
}

/**
 * ============================================
 * LISTA DE ADJACÊNCIA (LISTA ENCADEADA)
 * ============================================
 */
class ListaAdjacencia {
  public cabeca: NoAdjacencia | null = null;
  public tamanho: number = 0;

  adicionar(destinoId: string, peso: number, conexao: Conexao): void {
    const novoNo = new NoAdjacencia(destinoId, peso, conexao);
    novoNo.proximo = this.cabeca;
    this.cabeca = novoNo;
    this.tamanho++;
  }

  remover(destinoId: string): boolean {
    if (!this.cabeca) return false;

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

  buscar(destinoId: string): NoAdjacencia | null {
    let atual = this.cabeca;
    while (atual) {
      if (atual.destinoId === destinoId) return atual;
      atual = atual.proximo;
    }
    return null;
  }

  todosVizinhos(): NoAdjacencia[] {
    const vizinhos: NoAdjacencia[] = [];
    let atual = this.cabeca;
    while (atual) {
      vizinhos.push(atual);
      atual = atual.proximo;
    }
    return vizinhos;
  }
}

/**
 * ============================================
 * HEAP MÍNIMO PARA DIJKSTRA
 * ============================================
 */
interface NoHeap {
  id: string;
  prioridade: number;
}

class HeapMinimo {
  private heap: NoHeap[] = [];
  private posicoes: Map<string, number> = new Map();

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

    if (esquerdo < this.heap.length && this.heap[esquerdo].prioridade < this.heap[menor].prioridade) {
      menor = esquerdo;
    }

    if (direito < this.heap.length && this.heap[direito].prioridade < this.heap[menor].prioridade) {
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
 * SERVIÇO PRINCIPAL DA REDE
 * ============================================
 */
@Injectable()
export class RedeService {
  // Estruturas do Grafo
  private vertices: Map<string, Dispositivo> = new Map();
  private adjacencias: Map<string, ListaAdjacencia> = new Map();
  private conexoes: Map<string, Conexao> = new Map();

  // Estado da simulação
  private pacotes: Map<string, Pacote> = new Map();
  private pacotesHistorico: Pacote[] = [];
  private ataques: Map<string, Ataque> = new Map();
  private logs: LogEvento[] = [];

  // Métricas
  private pacotesEnviados = 0;
  private pacotesEntregues = 0;
  private pacotesPerdidos = 0;

  constructor() {
    this.inicializarRedeDemostracao();
  }

  // ============================================
  // INICIALIZAÇÃO COM DADOS DE DEMONSTRAÇÃO
  // ============================================

  private inicializarRedeDemostracao(): void {
    // ============================================
    // CARREGA DADOS DA SEED
    // ============================================
    
    // Cria todos os dispositivos da seed
    const dispositivosCriados: Dispositivo[] = [];
    
    for (const dto of dispositivosSeed) {
      const dispositivo = this.criarDispositivo(dto);
      dispositivosCriados.push(dispositivo);
    }

    // Cria todas as conexões da seed
    for (const conexaoDef of conexoesSeedDef) {
      const origem = dispositivosCriados[conexaoDef.origemIndex];
      const destino = dispositivosCriados[conexaoDef.destinoIndex];
      
      if (origem && destino) {
        this.criarConexao({
          origem: origem.id,
          destino: destino.id,
          tipo: conexaoDef.tipo,
          latencia: conexaoDef.latencia,
          banda: conexaoDef.banda,
          bidirecional: true,
        });
      }
    }

    // Adiciona logs iniciais
    for (const log of logsIniciais) {
      this.adicionarLog(log.tipo, log.mensagem);
    }

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║  🌴 SEED CARREGADA COM SUCESSO!                          ║
    ║  📡 ${dispositivosCriados.length} dispositivos criados                          ║
    ║  🔗 ${conexoesSeedDef.length} conexões estabelecidas                        ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  }

  // ============================================
  // OPERAÇÕES COM DISPOSITIVOS
  // ============================================

  criarDispositivo(dto: CriarDispositivoDto): Dispositivo {
    const id = uuidv4();
    const dispositivo: Dispositivo = {
      id,
      nome: dto.nome,
      tipo: dto.tipo,
      status: StatusDispositivo.ONLINE,
      ip: dto.ip || this.gerarIP(),
      mac: this.gerarMAC(),
      x: dto.x,
      y: dto.y,
      capacidadeProcessamento: dto.capacidadeProcessamento || 50,
      cargaAtual: 0,
      pacotesProcessados: 0,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    this.vertices.set(id, dispositivo);
    this.adjacencias.set(id, new ListaAdjacencia());
    this.adicionarLog('INFO', `Dispositivo "${dispositivo.nome}" adicionado`, [id]);

    return dispositivo;
  }

  removerDispositivo(id: string): boolean {
    const dispositivo = this.vertices.get(id);
    if (!dispositivo) return false;

    // Remove conexões associadas
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

    const listaDoVertice = this.adjacencias.get(id);
    if (listaDoVertice) {
      for (const vizinho of listaDoVertice.todosVizinhos()) {
        this.conexoes.delete(vizinho.conexao.id);
      }
    }

    this.vertices.delete(id);
    this.adjacencias.delete(id);
    this.adicionarLog('WARNING', `Dispositivo "${dispositivo.nome}" removido`, [id]);

    return true;
  }

  atualizarDispositivo(id: string, updates: Partial<Dispositivo>): Dispositivo | null {
    const dispositivo = this.vertices.get(id);
    if (!dispositivo) return null;

    Object.assign(dispositivo, updates, { atualizadoEm: new Date() });
    return dispositivo;
  }

  alterarStatusDispositivo(id: string, status: StatusDispositivo): Dispositivo | null {
    const dispositivo = this.vertices.get(id);
    if (!dispositivo) return null;

    const statusAnterior = dispositivo.status;
    dispositivo.status = status;
    dispositivo.atualizadoEm = new Date();

    this.adicionarLog(
      status === StatusDispositivo.OFFLINE ? 'ERROR' : 'INFO',
      `${dispositivo.nome}: ${statusAnterior} → ${status}`,
      [id],
    );

    return dispositivo;
  }

  getDispositivo(id: string): Dispositivo | null {
    return this.vertices.get(id) || null;
  }

  getTodosDispositivos(): Dispositivo[] {
    return Array.from(this.vertices.values());
  }

  // ============================================
  // OPERAÇÕES COM CONEXÕES
  // ============================================

  criarConexao(dto: CriarConexaoDto): Conexao {
    const origem = this.vertices.get(dto.origem);
    const destino = this.vertices.get(dto.destino);

    if (!origem) throw new Error(`Dispositivo origem ${dto.origem} não encontrado`);
    if (!destino) throw new Error(`Dispositivo destino ${dto.destino} não encontrado`);

    const id = uuidv4();
    const conexao: Conexao = {
      id,
      origem: dto.origem,
      destino: dto.destino,
      tipo: dto.tipo,
      status: StatusConexao.ATIVA,
      latencia: dto.latencia || 10,
      banda: dto.banda || 100,
      bandaUsada: 0,
      perda: 0,
      peso: 0,
      bidirecional: dto.bidirecional ?? true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    conexao.peso = this.calcularPesoConexao(conexao);

    const lista = this.adjacencias.get(dto.origem)!;
    lista.adicionar(dto.destino, conexao.peso, conexao);

    if (conexao.bidirecional) {
      const conexaoReversa: Conexao = {
        ...conexao,
        id: `${id}_rev`,
        origem: dto.destino,
        destino: dto.origem,
      };
      const listaReversa = this.adjacencias.get(dto.destino)!;
      listaReversa.adicionar(dto.origem, conexao.peso, conexaoReversa);
    }

    this.conexoes.set(id, conexao);
    return conexao;
  }

  removerConexao(id: string): boolean {
    const conexao = this.conexoes.get(id);
    if (!conexao) return false;

    const lista = this.adjacencias.get(conexao.origem);
    if (lista) lista.remover(conexao.destino);

    if (conexao.bidirecional) {
      const listaReversa = this.adjacencias.get(conexao.destino);
      if (listaReversa) listaReversa.remover(conexao.origem);
    }

    this.conexoes.delete(id);
    this.adicionarLog('WARNING', `Conexão removida`, [conexao.origem, conexao.destino]);

    return true;
  }

  alterarStatusConexao(id: string, status: StatusConexao): Conexao | null {
    const conexao = this.conexoes.get(id);
    if (!conexao) return null;

    conexao.status = status;
    conexao.atualizadoEm = new Date();

    return conexao;
  }

  getTodasConexoes(): Conexao[] {
    return Array.from(this.conexoes.values());
  }

  private calcularPesoConexao(conexao: Conexao): number {
    const bandaDisponivel = Math.max(0, conexao.banda - conexao.bandaUsada);
    const percentualBanda = conexao.banda > 0 ? (bandaDisponivel / conexao.banda) * 100 : 0;
    return conexao.latencia + (100 - percentualBanda) + conexao.perda * 10;
  }

  // ============================================
  // ALGORITMOS DE BUSCA DE CAMINHO
  // ============================================

  buscarCaminho(origemId: string, destinoId: string, algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' = 'DIJKSTRA'): ResultadoCaminho {
    switch (algoritmo) {
      case 'BFS':
        return this.bfs(origemId, destinoId);
      case 'DFS':
        return this.dfs(origemId, destinoId);
      default:
        return this.dijkstra(origemId, destinoId);
    }
  }

  private bfs(origemId: string, destinoId: string): ResultadoCaminho {
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
          const dispositivo = this.vertices.get(vizinho.destinoId);
          if (
            !visitados.has(vizinho.destinoId) &&
            dispositivo?.status === StatusDispositivo.ONLINE &&
            vizinho.conexao.status === StatusConexao.ATIVA
          ) {
            visitados.add(vizinho.destinoId);
            predecessores.set(vizinho.destinoId, atual);
            fila.push(vizinho.destinoId);
          }
        }
      }
    }

    return this.resultadoNaoEncontrado('BFS');
  }

  private dfs(origemId: string, destinoId: string): ResultadoCaminho {
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
            if (
              !visitados.has(vizinho.destinoId) &&
              dispositivo?.status === StatusDispositivo.ONLINE &&
              vizinho.conexao.status === StatusConexao.ATIVA
            ) {
              predecessores.set(vizinho.destinoId, atual);
              pilha.push(vizinho.destinoId);
            }
          }
        }
      }
    }

    return this.resultadoNaoEncontrado('DFS');
  }

  private dijkstra(origemId: string, destinoId: string): ResultadoCaminho {
    if (!this.vertices.has(origemId) || !this.vertices.has(destinoId)) {
      return this.resultadoNaoEncontrado('DIJKSTRA');
    }

    const distancias = new Map<string, number>();
    const predecessores = new Map<string, string>();
    const heap = new HeapMinimo();

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

          if (
            dispositivo?.status !== StatusDispositivo.ONLINE ||
            vizinho.conexao.status !== StatusConexao.ATIVA
          ) {
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

  private reconstruirCaminho(
    origemId: string,
    destinoId: string,
    predecessores: Map<string, string>,
    algoritmo: 'DIJKSTRA' | 'BFS' | 'DFS' | 'BELLMAN_FORD',
  ): ResultadoCaminho {
    const caminho: string[] = [];
    let atual: string | undefined = destinoId;

    while (atual) {
      caminho.unshift(atual);
      atual = predecessores.get(atual);
    }

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
  // ANÁLISE DE COMPONENTES CONECTADOS
  // ============================================

  componentesConectados(): ComponenteConectado[] {
    const visitados = new Set<string>();
    const componentes: ComponenteConectado[] = [];
    let componenteId = 0;

    this.vertices.forEach((dispositivo, verticeId) => {
      if (!visitados.has(verticeId) && dispositivo.status === StatusDispositivo.ONLINE) {
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
        const dispositivo = this.vertices.get(vizinho.destinoId);
        if (
          !visitados.has(vizinho.destinoId) &&
          dispositivo?.status === StatusDispositivo.ONLINE &&
          vizinho.conexao.status === StatusConexao.ATIVA
        ) {
          this.dfsComponente(vizinho.destinoId, visitados, dispositivos);
        }
      }
    }
  }

  // ============================================
  // SIMULAÇÃO DE PACOTES
  // ============================================

  enviarPacote(dto: EnviarPacoteDto): Pacote {
    const resultado = this.buscarCaminho(dto.origem, dto.destino, dto.algoritmo || 'DIJKSTRA');

    const pacote: Pacote = {
      id: uuidv4(),
      origem: dto.origem,
      destino: dto.destino,
      tamanho: dto.tamanho || 64,
      prioridade: dto.prioridade || 5,
      ttl: 64,
      rota: resultado.caminho,
      rotaPercorrida: [],
      status: resultado.encontrado ? 'ENVIANDO' : 'PERDIDO',
      tempoInicio: new Date(),
    };

    this.pacotesEnviados++;

    if (resultado.encontrado) {
      this.pacotes.set(pacote.id, pacote);
      this.adicionarLog('INFO', `Pacote enviado de ${this.vertices.get(dto.origem)?.nome} para ${this.vertices.get(dto.destino)?.nome}`, resultado.caminho);

      // Simula entrega
      setTimeout(() => this.entregarPacote(pacote.id), resultado.latenciaEstimada * 100);
    } else {
      pacote.status = 'PERDIDO';
      this.pacotesPerdidos++;
      this.adicionarLog('ERROR', `Falha ao enviar pacote: caminho não encontrado`, [dto.origem, dto.destino]);
    }

    this.pacotesHistorico.push(pacote);
    return pacote;
  }

  private entregarPacote(pacoteId: string): void {
    const pacote = this.pacotes.get(pacoteId);
    if (!pacote) return;

    pacote.status = 'ENTREGUE';
    pacote.rotaPercorrida = [...pacote.rota];
    pacote.tempoFim = new Date();
    this.pacotesEntregues++;

    // Atualiza contador de pacotes processados em cada dispositivo da rota
    for (const dispositivoId of pacote.rota) {
      const dispositivo = this.vertices.get(dispositivoId);
      if (dispositivo) {
        dispositivo.pacotesProcessados++;
      }
    }

    this.pacotes.delete(pacoteId);
    this.adicionarLog('SUCCESS', `Pacote entregue com sucesso!`, pacote.rota);
  }

  getPacotesAtivos(): Pacote[] {
    return Array.from(this.pacotes.values());
  }

  // ============================================
  // SIMULAÇÃO DE ATAQUES
  // ============================================

  iniciarAtaque(dto: SimularAtaqueDto): Ataque {
    const ataque: Ataque = {
      id: uuidv4(),
      tipo: dto.tipo,
      alvos: dto.alvos,
      intensidade: dto.intensidade || 50,
      propagacao: dto.tipo === TipoAtaque.MALWARE,
      ativo: true,
      iniciadoEm: new Date(),
    };

    this.ataques.set(ataque.id, ataque);

    // Aplica efeitos do ataque
    for (const alvoId of dto.alvos) {
      const dispositivo = this.vertices.get(alvoId);
      if (dispositivo) {
        switch (dto.tipo) {
          case TipoAtaque.DOS:
          case TipoAtaque.DDOS:
            dispositivo.cargaAtual = Math.min(100, dispositivo.cargaAtual + ataque.intensidade);
            if (dispositivo.cargaAtual >= 90) {
              dispositivo.status = StatusDispositivo.CONGESTIONADO;
            }
            break;
          case TipoAtaque.MALWARE:
          case TipoAtaque.MAN_IN_MIDDLE:
          case TipoAtaque.ROTEADOR_MALICIOSO:
            dispositivo.status = StatusDispositivo.COMPROMETIDO;
            break;
        }
      }
    }

    this.adicionarLog('ATTACK', `⚠️ Ataque ${dto.tipo} iniciado!`, dto.alvos);

    return ataque;
  }

  pararAtaque(ataqueId: string): boolean {
    const ataque = this.ataques.get(ataqueId);
    if (!ataque) return false;

    ataque.ativo = false;

    // Restaura dispositivos
    for (const alvoId of ataque.alvos) {
      const dispositivo = this.vertices.get(alvoId);
      if (dispositivo) {
        dispositivo.status = StatusDispositivo.ONLINE;
        dispositivo.cargaAtual = Math.max(0, dispositivo.cargaAtual - ataque.intensidade);
      }
    }

    this.ataques.delete(ataqueId);
    this.adicionarLog('SUCCESS', `Ataque neutralizado`, ataque.alvos);

    return true;
  }

  getAtaquesAtivos(): Ataque[] {
    return Array.from(this.ataques.values());
  }

  // ============================================
  // SIMULAÇÃO DE FALHAS
  // ============================================

  simularFalhaDispositivo(id: string): boolean {
    const dispositivo = this.vertices.get(id);
    if (!dispositivo) return false;

    dispositivo.status = StatusDispositivo.OFFLINE;
    this.adicionarLog('ERROR', `💥 ${dispositivo.nome} ficou OFFLINE!`, [id]);

    return true;
  }

  simularFalhaConexao(id: string): boolean {
    const conexao = this.conexoes.get(id);
    if (!conexao) return false;

    conexao.status = StatusConexao.INATIVA;
    this.adicionarLog('ERROR', `🔌 Link desconectado`, [conexao.origem, conexao.destino]);

    return true;
  }

  recuperarDispositivo(id: string): boolean {
    const dispositivo = this.vertices.get(id);
    if (!dispositivo) return false;

    dispositivo.status = StatusDispositivo.ONLINE;
    dispositivo.cargaAtual = 0;
    this.adicionarLog('SUCCESS', `✅ ${dispositivo.nome} está ONLINE novamente!`, [id]);

    return true;
  }

  recuperarConexao(id: string): boolean {
    const conexao = this.conexoes.get(id);
    if (!conexao) return false;

    conexao.status = StatusConexao.ATIVA;
    this.adicionarLog('SUCCESS', `✅ Link restaurado`, [conexao.origem, conexao.destino]);

    return true;
  }

  // ============================================
  // MÉTRICAS E ESTATÍSTICAS
  // ============================================

  getMetricas(): MetricasRede {
    const dispositivos = this.getTodosDispositivos();
    const conexoes = this.getTodasConexoes();

    const dispositivosOnline = dispositivos.filter((d) => d.status === StatusDispositivo.ONLINE).length;
    const conexoesAtivas = conexoes.filter((c) => c.status === StatusConexao.ATIVA).length;

    const latenciaMedia =
      conexoes.length > 0 ? conexoes.reduce((acc, c) => acc + c.latencia, 0) / conexoes.length : 0;

    const throughputTotal = conexoes.reduce((acc, c) => acc + (c.banda - c.bandaUsada), 0);

    const congestionamentos = conexoes.filter((c) => c.bandaUsada / c.banda > 0.8).length;

    return {
      totalDispositivos: dispositivos.length,
      dispositivosOnline,
      dispositivosOffline: dispositivos.length - dispositivosOnline,
      totalConexoes: conexoes.length,
      conexoesAtivas,
      pacotesEnviados: this.pacotesEnviados,
      pacotesEntregues: this.pacotesEntregues,
      pacotesPerdidos: this.pacotesPerdidos,
      latenciaMedia,
      throughputTotal,
      congestionamentos,
      tempoMedioRota: 0,
    };
  }

  detectarGargalos(): Conexao[] {
    return this.getTodasConexoes()
      .filter((c) => c.bandaUsada / c.banda > 0.8)
      .sort((a, b) => b.bandaUsada / b.banda - a.bandaUsada / a.banda);
  }

  // ============================================
  // LOGS
  // ============================================

  private adicionarLog(tipo: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'ATTACK', mensagem: string, dispositivos?: string[]): void {
    const log: LogEvento = {
      id: uuidv4(),
      timestamp: new Date(),
      tipo,
      mensagem,
      dispositivos,
    };
    this.logs.unshift(log);
    if (this.logs.length > 100) this.logs.pop();
  }

  getLogs(): LogEvento[] {
    return this.logs;
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  private gerarIP(): string {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private gerarMAC(): string {
    const hex = () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0');
    return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`.toUpperCase();
  }

  exportarGrafo(): { nodes: Dispositivo[]; edges: Conexao[] } {
    return {
      nodes: this.getTodosDispositivos(),
      edges: this.getTodasConexoes(),
    };
  }

  resetarRede(): void {
    this.vertices.clear();
    this.adjacencias.clear();
    this.conexoes.clear();
    this.pacotes.clear();
    this.pacotesHistorico = [];
    this.ataques.clear();
    this.logs = [];
    this.pacotesEnviados = 0;
    this.pacotesEntregues = 0;
    this.pacotesPerdidos = 0;

    this.inicializarRedeDemostracao();
  }
}

