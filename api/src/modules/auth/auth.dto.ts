import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ example: 'admin@dashify.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: '987654' })
  @IsString()
  @IsNotEmpty({ message: 'Matrícula é obrigatória' })
  matricula: string;

  @ApiProperty({ example: 'joao@dashify.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'senhaAntiga123' })
  @IsString()
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({ example: 'novaSenhaSegura456' })
  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}

export class ForceResetDto {
  @ApiProperty({ example: 'usuario@dashify.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;
}

// ==========================================
// DTOs de Resposta (Swagger Output)
// ==========================================

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Administrador Dashify' })
  nome: string;

  @ApiProperty({ example: '987654' })
  matricula: string;

  @ApiProperty({ example: 'admin@dashify.com' })
  email: string;

  @ApiProperty({ example: false })
  must_change_password: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'admin@dashify.com' })
  email: string;

  @ApiProperty({ example: '987654' })
  matricula: string;
}

export class ForceResetResponseDto {
  @ApiProperty({
    example: 'Usuário forçado a trocar de senha no próximo login',
  })
  message: string;
}
