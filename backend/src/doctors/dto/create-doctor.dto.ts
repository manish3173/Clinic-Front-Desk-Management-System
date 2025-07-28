import { IsString, IsEmail, IsPhoneNumber, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { DoctorSpecialization, Gender } from '../entities/doctor.entity';

export class CreateDoctorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(DoctorSpecialization)
  specialization: DoctorSpecialization;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];
}
