import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      // CASO 1: Conflito (Unique constraint violation)
      case 'P2002': {
        // <--- ADICIONEI ESTA CHAVE
        const status = HttpStatus.CONFLICT;
        const target = exception.meta?.target; // Captura qual campo deu erro

        response.status(status).json({
          statusCode: status,
          message: `Conflito: O valor informado para o campo '${target}' já existe.`,
          error: 'Conflict',
        });
        break;
      } // <--- FECHA A CHAVE AQUI

      // CASO 2: Registro não encontrado
      case 'P2025': {
        // <--- ADICIONEI ESTA CHAVE
        const status = HttpStatus.NOT_FOUND;

        response.status(status).json({
          statusCode: status,
          message: 'Registro não encontrado para a operação solicitada.',
          error: 'Not Found',
        });
        break;
      } // <--- FECHA A CHAVE AQUI

      // DEFAULT: Erro genérico
      default: {
        // Log do erro real no console do servidor para você debugar
        console.error('Erro Prisma não tratado:', exception);

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message: 'Erro interno no processamento dos dados.',
          error: 'Internal Server Error',
        });
        break;
      }
    }
  }
}
