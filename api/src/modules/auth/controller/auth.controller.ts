import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import {
  AuthDto,
  RegisterDto,
  ChangePasswordDto,
  ForceResetDto,
  LoginResponseDto,
  RegisterResponseDto,
  ForceResetResponseDto,
} from '../auth.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { UserService } from 'src/modules/user/service/user.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Realiza o login do usuário' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() authDto: AuthDto): Promise<LoginResponseDto> {
    return this.authService.login(authDto);
  }

  @ApiOperation({ summary: 'Registra um novo administrador' })
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Altera a senha do usuário autenticado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.changePassword(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Força a redefinição de senha para um usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('force-reset')
  @HttpCode(HttpStatus.OK)
  forceReset(@Body() dto: ForceResetDto): Promise<ForceResetResponseDto> {
    return this.userService.forcePasswordChange(dto.email).then(() => ({
      message: 'Usuário forçado a trocar de senha no próximo login',
    }));
  }

  // 💡 NOVA ROTA: Serve apenas para registrar a trilha de auditoria
  @ApiOperation({ summary: 'Registra o logout do usuário no log de auditoria' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logout registrado com sucesso' };
  }
}
