import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}

  async register(dto: RegisterDto) {

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (utilisateur) {
      throw new BadRequestException(
        'Cet email existe déjà.',
      );
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const nouveauUtilisateur =
      await this.prisma.utilisateur.create({
        data: {
          nom: dto.nom,
          prenom: dto.prenom,
          email: dto.email,
          password: hash,
          role: dto.role,
        },
      });

    return {
      message: 'Utilisateur créé avec succès',
      utilisateur: {
        id: nouveauUtilisateur.id,
        nom: nouveauUtilisateur.nom,
        prenom: nouveauUtilisateur.prenom,
        email: nouveauUtilisateur.email,
        role: nouveauUtilisateur.role,
      },
    };
  }
  async login(dto: LoginDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!utilisateur) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const motDePasseValide = await bcrypt.compare(
      dto.password,
      utilisateur.password,
    );

    if (!motDePasseValide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const payload = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    };
  }

}