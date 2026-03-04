import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from 'src/modules/user/service/user.service';
import { AuthDto, RegisterDto, ChangePasswordDto } from '../auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.usersService.findByEmail(authDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await argon2.verify(user.senha, authDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      matricula: user.matricula,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        matricula: user.matricula,
        email: user.email,
        // Garante que será boolean, mesmo que o Prisma retorne null
        must_change_password: user.must_change_password ?? true,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await argon2.hash(registerDto.password);
    const user = await this.usersService.create({
      nome: registerDto.nome,
      matricula: registerDto.matricula,
      email: registerDto.email,
      senha: hashedPassword,
      must_change_password: true,
    });
    return { id: user.id, email: user.email, matricula: user.matricula };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const isPasswordValid = await argon2.verify(
      user.senha,
      dto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    const hashedNewPassword = await argon2.hash(dto.newPassword);

    await this.usersService.updatePassword(userId, hashedNewPassword, false);

    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      matricula: user.matricula,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        matricula: user.matricula,
        email: user.email,
        must_change_password: false, // Aqui já é explicitamente boolean
      },
    };
  }
}
