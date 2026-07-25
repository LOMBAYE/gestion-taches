import { Injectable } from '@nestjs/common';

import { CreateTachDto } from './dto/create-tach.dto';
import { UpdateTachDto } from './dto/update-tach.dto';

import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class TachesService {

  constructor(
    private prisma: PrismaService,
  ) {}


  // Création d'une tâche
  async create(
    dto: CreateTachDto,
    utilisateurId: string,
  ) {
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
      include:{
        createur:true,
      },
    });

  }


  if (utilisateur.role === 'MANAGER') {

    return this.prisma.tache.findMany({
      where:{
        statut:'SOUMISE',
      },
      include:{
        createur:true,
      },
    });

  }


  // COLLABORATEUR

  return this.prisma.tache.findMany({
    where:{
      createurId: utilisateur.id,
    },
    include:{
      createur:true,
    },
  });

}




  // Détail d'une tâche
  async findOne(id: string) {

    return this.prisma.tache.findUnique({
      where: {
        id,
      },
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

  }



  // Modification générale
  async update(
    id: string,
    dto: UpdateTachDto,
  ) {

    return this.prisma.tache.update({
      where: {
        id,
      },
      data: dto,
    });

  }



  // COLLABORATEUR : soumettre une tâche
  async soumettre(id: string) {

    return this.prisma.tache.update({

      where: {
        id,
      },

      data: {
        statut: 'SOUMISE',
      },

    });

  }



  // MANAGER : valider une tâche
  async valider(id: string) {

    return this.prisma.tache.update({

      where: {
        id,
      },

      data: {
        statut: 'VALIDEE',
      },

    });

  }



  // Suppression
  async remove(id: string) {

    return this.prisma.tache.delete({

      where: {
        id,
      },

    });

  }

}