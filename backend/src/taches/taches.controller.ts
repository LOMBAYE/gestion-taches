import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';


import { TachesService } from './taches.service';

import { CreateTachDto } from './dto/create-tach.dto';
import { UpdateTachDto } from './dto/update-tach.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';



@Controller('taches')
export class TachesController {


  constructor(
    private readonly tachesService: TachesService,
  ) {}



  /**
   * Créer une tâche
   * POST /taches
   * 
   * Autorisé :
   * COLLABORATEUR
   */
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('COLLABORATEUR')
  @Post()
  create(
    @Body() dto: CreateTachDto,
    @CurrentUser() utilisateur: any,
  ) {

    return this.tachesService.create(
      dto,
      utilisateur.id,
    );

  }




  /**
   * Liste des tâches
   * GET /taches
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() utilisateur: any,
  ) {

    return this.tachesService.findAll(utilisateur);

  }





  /**
   * Détail tâche
   * GET /taches/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id:string,
  ) {

    return this.tachesService.findOne(id);

  }





  /**
   * Soumettre une tâche
   * PATCH /taches/:id/soumettre
   *
   * Autorisé :
   * COLLABORATEUR
   */
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('COLLABORATEUR')
  @Patch(':id/soumettre')
  soumettre(
    @Param('id') id:string,
  ) {

    return this.tachesService.soumettre(id);

  }





  /**
   * Valider une tâche
   * PATCH /taches/:id/valider
   *
   * Autorisé :
   * MANAGER
   */
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('MANAGER')
  @Patch(':id/valider')
  valider(
    @Param('id') id:string,
  ) {

    return this.tachesService.valider(id);

  }





  /**
   * Modification générale
   *
   * À supprimer ou limiter ensuite,
   * car elle permettrait de changer le statut directement.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id:string,
    @Body() dto:UpdateTachDto,
  ) {

    return this.tachesService.update(
      id,
      dto,
    );

  }

}