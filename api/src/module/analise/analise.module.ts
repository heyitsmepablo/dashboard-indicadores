import { Module } from '@nestjs/common';
import { AnaliseController } from './controller/analise.controller';
import { AnaliseService } from './service/analise.service';
import { IndicadorService } from '../inidicador/service/indicador-service.service';
import { ResultadoService } from 'src/services/resultado-service/resultado-service.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/services/prisma-service/prisma-service.service';

@Module({
  imports: [HttpModule],
  controllers: [AnaliseController],
  providers: [
    AnaliseService,
    IndicadorService,
    ResultadoService,

    PrismaService,
  ],
})
export class AnaliseModule {}
