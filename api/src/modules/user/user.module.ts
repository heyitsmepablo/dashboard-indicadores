import { Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma-service.service';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
  providers: [UserService, PrismaService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
