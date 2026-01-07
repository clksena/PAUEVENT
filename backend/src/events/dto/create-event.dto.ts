import { IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(1)
  maxParticipants: number;
}

