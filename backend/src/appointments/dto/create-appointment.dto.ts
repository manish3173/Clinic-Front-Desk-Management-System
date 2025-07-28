import { IsNumber, IsDateString, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  doctorId: number;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isPriority?: boolean;
}
