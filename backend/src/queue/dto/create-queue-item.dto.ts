import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { Priority } from '../entities/queue-item.entity';

export class CreateQueueItemDto {
  @IsNumber()
  patientId: number;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
