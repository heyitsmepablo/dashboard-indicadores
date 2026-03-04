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
  async login(@Body() authDto: AuthDto): Promise<LoginResponseDto> {
    return await this.authService.login(authDto);
  }

  @ApiOperation({ summary: 'Registra um novo administrador' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return await this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Altera a senha do usuário autenticado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.authService.changePassword(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Força a redefinição de senha para um usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('force-reset')
  @HttpCode(HttpStatus.OK)
  async forceReset(@Body() dto: ForceResetDto): Promise<ForceResetResponseDto> {
    await this.userService.forcePasswordChange(dto.email);
    return { message: 'Usuário forçado a trocar de senha no próximo login' };
  }
}
