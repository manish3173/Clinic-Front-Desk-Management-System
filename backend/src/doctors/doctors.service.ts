import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Doctor, DoctorSpecialization } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorsRepository.create(createDoctorDto);
    return await this.doctorsRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      relations: ['appointments'],
    });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['appointments'],
    });
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    await this.doctorsRepository.update(id, updateDoctorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    
    // Remove related appointments first
    if (doctor.appointments && doctor.appointments.length > 0) {
      await this.doctorsRepository
        .createQueryBuilder()
        .delete()
        .from('appointments')
        .where('doctorId = :id', { id })
        .execute();
    }
    
    // Now remove the doctor
    const result = await this.doctorsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  async findBySpecialization(specialization: DoctorSpecialization): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      where: { specialization },
      relations: ['appointments'],
    });
  }

  async findByLocation(location: string): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      where: { location: Like(`%${location}%`) },
      relations: ['appointments'],
    });
  }

  async findAvailable(): Promise<Doctor[]> {
    return await this.doctorsRepository.find({
      where: { isAvailable: true },
      relations: ['appointments'],
    });
  }

  async searchDoctors(query: {
    specialization?: DoctorSpecialization;
    location?: string;
    isAvailable?: boolean;
  }): Promise<Doctor[]> {
    const whereConditions: any = {};

    if (query.specialization) {
      whereConditions.specialization = query.specialization;
    }

    if (query.location) {
      whereConditions.location = Like(`%${query.location}%`);
    }

    if (query.isAvailable !== undefined) {
      whereConditions.isAvailable = query.isAvailable;
    }

    return await this.doctorsRepository.find({
      where: whereConditions,
      relations: ['appointments'],
    });
  }
}
