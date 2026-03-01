import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from 'src/module/user/service/user.service';
import { AuthDto } from '../auth.dto';

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

    // payload.sub agora é uma string (UUID)
    const payload = { sub: user.id, email: user.email, nome: user.nome };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, // Retorna UUID
        nome: user.nome,
        email: user.email,
      },
    };
  }

  async register(authDto: AuthDto) {
    const hashedPassword = await argon2.hash(authDto.password);
    const user = await this.usersService.create({
      nome: 'Administrador Dashify',
      email: authDto.email,
      senha: hashedPassword,
    });
    return { id: user.id, email: user.email };
  }
}
