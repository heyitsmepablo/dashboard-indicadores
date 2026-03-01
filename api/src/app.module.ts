import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IndicadorController } from './module/inidicador/controller/indicador.controller';

import { PrismaService } from './services/prisma-service/prisma-service.service';
import { ResultadoService } from './services/resultado-service/resultado-service.service';
import { IndicadorService } from './module/inidicador/service/indicador-service.service';
import { ResultadosController } from './controllers/resultado/resultado.controller';
import { ConfigModule } from '@nestjs/config';
import { UnidadeService } from './services/unidade/unidade.service';
import { UnidadesController } from './controllers/unidade/unidade.controller';
import { TipoUnidadeController } from './controllers/tipo-de-unidade/tipo-de-unidade.controller';
import { TipoUnidadeService } from './services/tipo-de-unidade-service/tipo-de-unidade-service.service';
import { SuperintendenciaService } from './services/superintendencia/superintendencia.service';
import { SuperintendenciaController } from './controllers/superintendencia/superintendencia.controller';

import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { AnaliseModule } from './module/analise/analise.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    AnaliseModule,
  ],
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
