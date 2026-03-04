import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IndicadorController } from './modules/inidicador/controller/indicador.controller';

import { PrismaService } from './services/prisma-service/prisma-service.service';
import { ResultadoService } from './modules/resultado/service/resultado-service.service';
import { IndicadorService } from './modules/inidicador/service/indicador-service.service';
import { ResultadoController } from './modules/resultado/controller/resultado.controller';
import { ConfigModule } from '@nestjs/config';
import { UnidadeService } from './modules/unidade/service/unidade.service';
import { UnidadesController } from './modules/unidade/controller/unidade.controller';
import { TipoUnidadeController } from './modules/tipo-de-unidade/controller/tipo-de-unidade.controller';
import { TipoDeUnidadeService } from './modules/tipo-de-unidade/service/tipo-de-unidade-service.service';
import { SuperintendenciaService } from './modules/superintendencia/service/superintendencia.service';
import { SuperintendenciaController } from './modules/superintendencia/controller/superintendencia.controller';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AnaliseModule } from './modules/analise/analise.module';

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
    ResultadoController,
    TipoUnidadeController,
    UnidadesController,
    SuperintendenciaController,
  ],
  providers: [
    AppService,
    PrismaService,
    IndicadorService,
    ResultadoService,
    TipoDeUnidadeService,
    UnidadeService,
    SuperintendenciaService,
  ],
})
export class AppModule {}
