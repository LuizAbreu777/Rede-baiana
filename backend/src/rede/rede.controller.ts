import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RedeService } from './rede.service';
import {
  CriarDispositivoDto,
  CriarConexaoDto,
  EnviarPacoteDto,
  SimularAtaqueDto,
  StatusDispositivo,
  StatusConexao,
} from './types';

@Controller('api/rede')
export class RedeController {
  constructor(private readonly redeService: RedeService) {}

  // ============================================
  // DISPOSITIVOS
  // ============================================

  @Get('dispositivos')
  getTodosDispositivos() {
    return this.redeService.getTodosDispositivos();
  }

  @Get('dispositivos/:id')
  getDispositivo(@Param('id') id: string) {
    return this.redeService.getDispositivo(id);
  }

  @Post('dispositivos')
  criarDispositivo(@Body() dto: CriarDispositivoDto) {
    return this.redeService.criarDispositivo(dto);
  }

  @Put('dispositivos/:id')
  atualizarDispositivo(@Param('id') id: string, @Body() updates: any) {
    return this.redeService.atualizarDispositivo(id, updates);
  }

  @Put('dispositivos/:id/status')
  alterarStatusDispositivo(
    @Param('id') id: string,
    @Body('status') status: StatusDispositivo,
  ) {
    return this.redeService.alterarStatusDispositivo(id, status);
  }

  @Delete('dispositivos/:id')
  removerDispositivo(@Param('id') id: string) {
    return { sucesso: this.redeService.removerDispositivo(id) };
  }

  // ============================================
  // CONEXÕES
  // ============================================

  @Get('conexoes')
  getTodasConexoes() {
    return this.redeService.getTodasConexoes();
  }

  @Post('conexoes')
  criarConexao(@Body() dto: CriarConexaoDto) {
    return this.redeService.criarConexao(dto);
  }

  @Put('conexoes/:id/status')
  alterarStatusConexao(
    @Param('id') id: string,
    @Body('status') status: StatusConexao,
  ) {
    return this.redeService.alterarStatusConexao(id, status);
  }

  @Delete('conexoes/:id')
  removerConexao(@Param('id') id: string) {
    return { sucesso: this.redeService.removerConexao(id) };
  }

  // ============================================
  // GRAFO E CAMINHOS
  // ============================================

  @Get('grafo')
  exportarGrafo() {
    return this.redeService.exportarGrafo();
  }

  @Get('caminho')
  buscarCaminho(
    @Query('origem') origem: string,
    @Query('destino') destino: string,
    @Query('algoritmo') algoritmo?: 'DIJKSTRA' | 'BFS' | 'DFS',
  ) {
    return this.redeService.buscarCaminho(origem, destino, algoritmo);
  }

  @Get('componentes')
  componentesConectados() {
    return this.redeService.componentesConectados();
  }

  // ============================================
  // SIMULAÇÃO DE TRÁFEGO
  // ============================================

  @Post('pacotes')
  enviarPacote(@Body() dto: EnviarPacoteDto) {
    return this.redeService.enviarPacote(dto);
  }

  @Get('pacotes')
  getPacotesAtivos() {
    return this.redeService.getPacotesAtivos();
  }

  // ============================================
  // SIMULAÇÃO DE FALHAS
  // ============================================

  @Post('falhas/dispositivo/:id')
  simularFalhaDispositivo(@Param('id') id: string) {
    return { sucesso: this.redeService.simularFalhaDispositivo(id) };
  }

  @Post('falhas/conexao/:id')
  simularFalhaConexao(@Param('id') id: string) {
    return { sucesso: this.redeService.simularFalhaConexao(id) };
  }

  @Post('recuperar/dispositivo/:id')
  recuperarDispositivo(@Param('id') id: string) {
    return { sucesso: this.redeService.recuperarDispositivo(id) };
  }

  @Post('recuperar/conexao/:id')
  recuperarConexao(@Param('id') id: string) {
    return { sucesso: this.redeService.recuperarConexao(id) };
  }

  // ============================================
  // SIMULAÇÃO DE ATAQUES
  // ============================================

  @Post('ataques')
  iniciarAtaque(@Body() dto: SimularAtaqueDto) {
    return this.redeService.iniciarAtaque(dto);
  }

  @Delete('ataques/:id')
  pararAtaque(@Param('id') id: string) {
    return { sucesso: this.redeService.pararAtaque(id) };
  }

  @Get('ataques')
  getAtaquesAtivos() {
    return this.redeService.getAtaquesAtivos();
  }

  // ============================================
  // MÉTRICAS E ANÁLISE
  // ============================================

  @Get('metricas')
  getMetricas() {
    return this.redeService.getMetricas();
  }

  @Get('gargalos')
  detectarGargalos() {
    return this.redeService.detectarGargalos();
  }

  @Get('logs')
  getLogs() {
    return this.redeService.getLogs();
  }

  // ============================================
  // CONTROLE
  // ============================================

  @Post('resetar')
  resetarRede() {
    this.redeService.resetarRede();
    return { sucesso: true, mensagem: 'Rede resetada com sucesso!' };
  }
}

