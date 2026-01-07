import { IsString, IsDateString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;
}

