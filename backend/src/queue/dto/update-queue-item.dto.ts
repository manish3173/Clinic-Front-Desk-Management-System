import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueItemDto } from './create-queue-item.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { QueueStatus } from '../entities/queue-item.entity';

export class UpdateQueueItemDto extends PartialType(CreateQueueItemDto) {
  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @IsOptional()
  @IsDateString()
  calledAt?: Date;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
