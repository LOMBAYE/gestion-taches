import { Module } from '@nestjs/common';

import { TachesController } from './taches.controller';
import { TachesService } from './taches.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    TachesController,
  ],
  providers: [
    TachesService,
  ],
})
export class TachesModule {}