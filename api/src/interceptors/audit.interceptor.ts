import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private getAcaoAmigavel(method: string, url: string): string {
    if (url.includes('/auth/login')) return 'Realizou login no sistema';
    if (url.includes('/auth/logout')) return 'Realizou logout do sistema';
    if (url.includes('/auth/change-password'))
      return 'Alterou a senha de acesso';

    switch (method) {
      case 'POST':
        return `Criou um novo registro em ${url}`;
      case 'PATCH':
      case 'PUT':
        return `Atualizou um registro em ${url}`;
      case 'DELETE':
        return `Removeu um registro de ${url}`;
      case 'GET':
        return `Acessou dados de ${url}`;
      default:
        return `Interagiu com ${url}`;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = decodeURIComponent(req.url || '');

    return next.handle().pipe(
      // Pegamos o "responseData" para inspecionar o que a API devolveu
      tap((responseData: any) => {
        // Padrão: Tenta pegar do token JWT (usuário já logado)
        let userId = req.user?.id || 'N/A';
        let userName = req.user?.nome || 'Usuário Não Autenticado';
        let userMatricula = req.user?.matricula || 'N/A';

        const acao = this.getAcaoAmigavel(method, url);

        // Exceção: Se for a rota de Login e deu sucesso, pega os dados do payload de resposta!
        if (url.includes('/auth/login') && responseData?.user) {
          userId = responseData.user.id;
          userName = responseData.user.nome;
          userMatricula = responseData.user.matricula;
        }

        // Formato final exigido: [ID - Nome - Matricula]
        this.logger.info(
          `[${userId} - ${userName} - Matrícula: ${userMatricula}] - [Ação: ${acao}]`,
          { isAudit: true, context: 'Audit' },
        );
      }),
    );
  }
}
