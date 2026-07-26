import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { CreateTachDto } from './dto/create-tach.dto';
import { UpdateTachDto } from './dto/update-tach.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TachesService {
  constructor(private prisma: PrismaService) {}

  // Création d'une tâche
  async create(dto: CreateTachDto, utilisateurId: string) {
    return this.prisma.tache.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        createurId: utilisateurId,
      },
    });
  }

  async findAll(utilisateur: any) {
    if (utilisateur.role === 'ADMINISTRATEUR') {
      return this.prisma.tache.findMany({
        include: {
          createur: true,
        },
      });
    }

    if (utilisateur.role === 'MANAGER') {
      return this.prisma.tache.findMany({
        where: {
          statut: { in: ['SOUMISE', 'VALIDEE', 'REJETEE'] },
        },
        include: {
          createur: true,
        },
      });
    }

    // COLLABORATEUR : ses propres tâches
    return this.prisma.tache.findMany({
      where: {
        createurId: utilisateur.id,
      },
      include: {
        createur: true,
      },
    });
  }

  // Détail d'une tâche
  async findOne(id: string) {
    const tache = await this.prisma.tache.findUnique({
      where: { id },
      include: {
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    return tache;
  }

  // Modification (COLLABORATEUR & BROUILLON uniquement)
  async update(id: string, dto: UpdateTachDto, utilisateur: any) {
    const tache = await this.prisma.tache.findUnique({ where: { id } });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    if (tache.createurId !== utilisateur.id) {
      throw new ForbiddenException('Seul le créateur peut modifier cette tâche');
    }

    if (tache.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Seules les tâches au statut BROUILLON peuvent être modifiées',
      );
    }

    return this.prisma.tache.update({
      where: { id },
      data: dto,
    });
  }

  // Soumission (COLLABORATEUR & BROUILLON uniquement)
  async soumettre(id: string, utilisateur: any) {
    const tache = await this.prisma.tache.findUnique({ where: { id } });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    if (tache.createurId !== utilisateur.id) {
      throw new ForbiddenException('Seul le créateur peut soumettre cette tâche');
    }

    if (tache.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Seules les tâches au statut BROUILLON peuvent être soumises',
      );
    }

    return this.prisma.tache.update({
      where: { id },
      data: { statut: 'SOUMISE' },
    });
  }

  // Validation (MANAGER uniquement & SOUMISE)
  async valider(id: string) {
    const tache = await this.prisma.tache.findUnique({ where: { id } });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    if (tache.statut !== 'SOUMISE') {
      throw new BadRequestException(
        'Seules les tâches au statut SOUMISE peuvent être validées',
      );
    }

    return this.prisma.tache.update({
      where: { id },
      data: { statut: 'VALIDEE' },
    });
  }

  // Rejet (MANAGER uniquement & SOUMISE)
  async rejeter(id: string) {
    const tache = await this.prisma.tache.findUnique({ where: { id } });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    if (tache.statut !== 'SOUMISE') {
      throw new BadRequestException(
        'Seules les tâches au statut SOUMISE peuvent être rejetées',
      );
    }

    return this.prisma.tache.update({
      where: { id },
      data: { statut: 'REJETEE' },
    });
  }

  // Suppression (COLLABORATEUR & BROUILLON uniquement)
  async remove(id: string, utilisateur: any) {
    const tache = await this.prisma.tache.findUnique({ where: { id } });

    if (!tache) {
      throw new NotFoundException('Tâche non trouvée');
    }

    if (tache.createurId !== utilisateur.id) {
      throw new ForbiddenException('Seul le créateur peut supprimer cette tâche');
    }

    if (tache.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Seules les tâches au statut BROUILLON peuvent être supprimées',
      );
    }

    return this.prisma.tache.delete({ where: { id } });
  }
}