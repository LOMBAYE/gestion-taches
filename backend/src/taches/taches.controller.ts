import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
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
  constructor(private readonly tachesService: TachesService) {}

  /**
   * Créer une tâche
   * POST /taches
   * Autorisé : COLLABORATEUR uniquement
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COLLABORATEUR')
  @Post()
  create(@Body() dto: CreateTachDto, @CurrentUser() utilisateur: any) {
    return this.tachesService.create(dto, utilisateur.id);
  }

  /**
   * Liste des tâches
   * GET /taches
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() utilisateur: any) {
    return this.tachesService.findAll(utilisateur);
  }

  /**
   * Détail d'une tâche
   * GET /taches/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tachesService.findOne(id);
  }

  /**
   * Soumettre une tâche
   * PATCH /taches/:id/soumettre
   * Autorisé : COLLABORATEUR uniquement (propres tâches BROUILLON)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COLLABORATEUR')
  @Patch(':id/soumettre')
  soumettre(@Param('id') id: string, @CurrentUser() utilisateur: any) {
    return this.tachesService.soumettre(id, utilisateur);
  }

  /**
   * Valider une tâche
   * PATCH /taches/:id/valider
   * Autorisé : MANAGER uniquement
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  @Patch(':id/valider')
  valider(@Param('id') id: string) {
    return this.tachesService.valider(id);
  }

  /**
   * Rejeter une tâche
   * PATCH /taches/:id/rejeter
   * Autorisé : MANAGER uniquement
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  @Patch(':id/rejeter')
  rejeter(@Param('id') id: string) {
    return this.tachesService.rejeter(id);
  }

  /**
   * Modification d'une tâche
   * PATCH /taches/:id
   * Autorisé : COLLABORATEUR uniquement (propres tâches BROUILLON)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COLLABORATEUR')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTachDto,
    @CurrentUser() utilisateur: any,
  ) {
    return this.tachesService.update(id, dto, utilisateur);
  }

  /**
   * Suppression d'une tâche
   * DELETE /taches/:id
   * Autorisé : COLLABORATEUR uniquement (propres tâches BROUILLON)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COLLABORATEUR')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() utilisateur: any) {
    return this.tachesService.remove(id, utilisateur);
  }
}