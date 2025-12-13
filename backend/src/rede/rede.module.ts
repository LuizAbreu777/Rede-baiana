import { Module } from '@nestjs/common';
import { RedeController } from './rede.controller';
import { RedeService } from './rede.service';
import { RedeGateway } from './rede.gateway';

@Module({
  controllers: [RedeController],
  providers: [RedeService, RedeGateway],
  exports: [RedeService],
})
export class RedeModule {}

