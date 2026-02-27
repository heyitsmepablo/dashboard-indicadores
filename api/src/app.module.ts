import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IndicadorController } from './controllers/indicador/indicador.controller';

import { PrismaService } from './services/prisma-service/prisma-service.service';
import { ResultadoService } from './services/resultado-service/resultado-service.service';
import { IndicadorService } from './services/indicadores-service/indicador-service.service';
import { ResultadosController } from './controllers/resultado/resultado.controller';
import { ConfigModule } from '@nestjs/config';
import { UnidadeService } from './services/unidade/unidade.service';
import { UnidadesController } from './controllers/unidade/unidade.controller';
import { TipoUnidadeController } from './controllers/tipo-de-unidade/tipo-de-unidade.controller';
import { TipoUnidadeService } from './services/tipo-de-unidade-service/tipo-de-unidade-service.service';
import { SuperintendenciaService } from './services/superintendencia/superintendencia.service';
import { SuperintendenciaController } from './controllers/superintendencia/superintendencia.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    AppController,
    IndicadorController,
    ResultadosController,
    TipoUnidadeController,
    UnidadesController,
    SuperintendenciaController,
  ],
  providers: [
    AppService,
    PrismaService,
    IndicadorService,
    ResultadoService,
    TipoUnidadeService,
    UnidadeService,
    SuperintendenciaService,
  ],
})
export class AppModule {}
