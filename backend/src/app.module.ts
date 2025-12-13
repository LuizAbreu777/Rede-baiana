import { Module } from '@nestjs/common';
import { RedeModule } from './rede/rede.module';

@Module({
  imports: [RedeModule],
})
export class AppModule {}

