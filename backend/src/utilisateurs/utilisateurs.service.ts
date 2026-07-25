import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
  return this.prisma.utilisateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
    },
  });
}
}