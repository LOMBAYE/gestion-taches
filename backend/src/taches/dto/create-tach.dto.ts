import { IsNotEmpty } from 'class-validator';

export class CreateTachDto {

  @IsNotEmpty()
  titre: string;

  @IsNotEmpty()
  description: string;

}