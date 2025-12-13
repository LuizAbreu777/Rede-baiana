import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS para o frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🌴 REDE BAIANA - Backend API                           ║
  ║   Simulador de Infraestrutura de Rede                    ║
  ║                                                           ║
  ║   🚀 Servidor rodando em: http://localhost:${port}          ║
  ║   📡 WebSocket habilitado para atualizações em tempo real ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

