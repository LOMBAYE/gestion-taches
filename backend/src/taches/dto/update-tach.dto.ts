import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Statut } from '@prisma/client';

export class UpdateTachDto {

  @IsOptional()
  @IsString()
  titre?: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsEnum(Statut)
  statut?: Statut;

}