import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaServiceService } from './services/prisma-service/prisma-service.service';
import { IndicadoresServiceService } from './services/indicadores-service/indicador-service.service';
import { ResultadoServiceService } from './services/resultado-service/resultado-service.service';
import { IndicadorController } from './controllers/indicador/indicador.controller';
import { ResultadoController } from './controllers/resultado/resultado.controller';

@Module({
  imports: [],
  controllers: [AppController, IndicadorController, ResultadoController],
  providers: [AppService, PrismaServiceService, IndicadoresServiceService, ResultadoServiceService],
})
export class AppModule {}
