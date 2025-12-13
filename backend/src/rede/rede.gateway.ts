import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedeService } from './rede.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class RedeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private intervaloAtualizacao: NodeJS.Timeout | null = null;

  constructor(private readonly redeService: RedeService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Cliente conectado: ${client.id}`);
    
    // Envia estado inicial
    client.emit('estado-inicial', {
      grafo: this.redeService.exportarGrafo(),
      metricas: this.redeService.getMetricas(),
      logs: this.redeService.getLogs(),
    });

    // Inicia atualizações periódicas se não estiver rodando
    if (!this.intervaloAtualizacao) {
      this.iniciarAtualizacoes();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Cliente desconectado: ${client.id}`);
  }

  private iniciarAtualizacoes() {
    this.intervaloAtualizacao = setInterval(() => {
      this.server.emit('atualizacao', {
        grafo: this.redeService.exportarGrafo(),
        metricas: this.redeService.getMetricas(),
        pacotes: this.redeService.getPacotesAtivos(),
        ataques: this.redeService.getAtaquesAtivos(),
        logs: this.redeService.getLogs().slice(0, 10),
      });
    }, 1000);
  }

  @SubscribeMessage('enviar-pacote')
  handleEnviarPacote(client: Socket, payload: any) {
    const pacote = this.redeService.enviarPacote(payload);
    this.server.emit('pacote-enviado', pacote);
    return pacote;
  }

  @SubscribeMessage('buscar-caminho')
  handleBuscarCaminho(client: Socket, payload: { origem: string; destino: string; algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS' }) {
    const resultado = this.redeService.buscarCaminho(payload.origem, payload.destino, payload.algoritmo);
    client.emit('caminho-encontrado', resultado);
    return resultado;
  }

  @SubscribeMessage('simular-falha')
  handleSimularFalha(client: Socket, payload: { tipo: 'dispositivo' | 'conexao'; id: string }) {
    if (payload.tipo === 'dispositivo') {
      this.redeService.simularFalhaDispositivo(payload.id);
    } else {
      this.redeService.simularFalhaConexao(payload.id);
    }
    this.server.emit('falha-simulada', payload);
  }

  @SubscribeMessage('recuperar')
  handleRecuperar(client: Socket, payload: { tipo: 'dispositivo' | 'conexao'; id: string }) {
    if (payload.tipo === 'dispositivo') {
      this.redeService.recuperarDispositivo(payload.id);
    } else {
      this.redeService.recuperarConexao(payload.id);
    }
    this.server.emit('recuperado', payload);
  }

  @SubscribeMessage('iniciar-ataque')
  handleIniciarAtaque(client: Socket, payload: any) {
    const ataque = this.redeService.iniciarAtaque(payload);
    this.server.emit('ataque-iniciado', ataque);
    return ataque;
  }

  @SubscribeMessage('parar-ataque')
  handlePararAtaque(client: Socket, payload: { id: string }) {
    this.redeService.pararAtaque(payload.id);
    this.server.emit('ataque-parado', payload);
  }

  @SubscribeMessage('resetar-rede')
  handleResetarRede(client: Socket) {
    this.redeService.resetarRede();
    this.server.emit('rede-resetada');
  }

  @SubscribeMessage('criar-dispositivo')
  handleCriarDispositivo(client: Socket, payload: any) {
    const dispositivo = this.redeService.criarDispositivo(payload);
    this.emitirAtualizacao();
    return dispositivo;
  }

  @SubscribeMessage('remover-dispositivo')
  handleRemoverDispositivo(client: Socket, payload: { id: string }) {
    this.redeService.removerDispositivo(payload.id);
    this.emitirAtualizacao();
  }

  @SubscribeMessage('criar-conexao')
  handleCriarConexao(client: Socket, payload: any) {
    const conexao = this.redeService.criarConexao(payload);
    this.emitirAtualizacao();
    return conexao;
  }

  @SubscribeMessage('remover-conexao')
  handleRemoverConexao(client: Socket, payload: { id: string }) {
    this.redeService.removerConexao(payload.id);
    this.emitirAtualizacao();
  }

  private emitirAtualizacao() {
    this.server.emit('atualizacao', {
      grafo: this.redeService.exportarGrafo(),
      metricas: this.redeService.getMetricas(),
      pacotes: this.redeService.getPacotesAtivos(),
      ataques: this.redeService.getAtaquesAtivos(),
      logs: this.redeService.getLogs().slice(0, 10),
    });
  }
}

